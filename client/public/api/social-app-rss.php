<?php
/** RSS 2.0 relay. Requires PHP 7.4+, cURL, DOM, libxml. IPv4-only by design. */
header('Access-Control-Allow-Origin: YOUR DOMAIN HERE');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respondError(string $message, int $status = 400): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}
if (!extension_loaded('curl') || !extension_loaded('dom')) respondError('Server extension missing.', 500);
$url = $_GET['q'] ?? null;
if (!is_string($url) || strlen($url) > 2048 || !filter_var($url, FILTER_VALIDATE_URL)) respondError('Invalid feed URL.');
$p = parse_url($url);
$scheme = strtolower($p['scheme'] ?? '');
$host = $p['host'] ?? '';
if (!in_array($scheme, ['http', 'https'], true) || !$host || isset($p['user']) || isset($p['pass'])) respondError('Unsupported URL.');
// Restrict to standard ports. Reject IP literals to simplify host verification.
$port = $scheme === 'https' ? 443 : 80;
if (isset($p['port']) && $p['port'] !== $port) respondError('Unsupported port.');
if (filter_var($host, FILTER_VALIDATE_IP) || !preg_match('/^[a-z0-9.-]+$/i', $host)) respondError('Use a public DNS hostname.');
$ips = gethostbynamel($host);
if (!$ips) respondError('Hostname did not resolve.', 502);
foreach ($ips as $ip) {
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        respondError('Private or reserved network address blocked.');
    }
}
// Pin cURL to an already-validated IP to reduce DNS rebinding risk.
$ch = curl_init($url);
$xml = '';
$oversize = false;
$maxBytes = 2 * 1024 * 1024;
$options = [
    CURLOPT_FOLLOWLOCATION => false, // Do not follow redirects to internal addresses.
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
    CURLOPT_RESOLVE => ["{$host}:{$port}:{$ips[0]}"],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'RSSAggregator/1.0',
    CURLOPT_HTTPHEADER => ['Accept: application/rss+xml, application/xml, text/xml, */*;q=0.5'],
    CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk) use (&$xml, &$oversize, $maxBytes): int {
        if (strlen($xml) + strlen($chunk) > $maxBytes) {
            $oversize = true;
            return 0;
        }
        $xml .= $chunk;
        return strlen($chunk);
    },
];
curl_setopt_array($ch, $options);
$success = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($oversize) respondError('Feed exceeds 2 MB limit.', 413);
if (!$success || $status < 200 || $status >= 300) respondError('Unable to retrieve feed (redirects are not followed).', 502);

// Reject DTDs entirely; LIBXML_NONET also prevents XML parser network requests.
libxml_use_internal_errors(true);
$doc = new DOMDocument();
$doc->resolveExternals = false;
$doc->substituteEntities = false;
if (!$doc->loadXML($xml, LIBXML_NONET) || $doc->doctype !== null) respondError('Invalid or unsupported XML feed.');
if (!$doc->documentElement || $doc->documentElement->localName !== 'rss') respondError('This endpoint currently supports RSS 2.0, not Atom.');

function childText(DOMElement $item, string $name, string $fallback = ''): string {
    foreach ($item->childNodes as $child) {
        if ($child instanceof DOMElement && $child->nodeName === $name) return $child->textContent;
    }
    return $fallback;
}
$results = [];
foreach ($doc->getElementsByTagName('item') as $item) {
    if (!($item instanceof DOMElement)) continue;
    $full = '';
    foreach ($item->childNodes as $child) {
        if ($child instanceof DOMElement && $child->localName === 'encoded' &&
            $child->namespaceURI === 'http://purl.org/rss/1.0/modules/content/') {
            $full = trim($child->textContent);
            break;
        }
    }
    $results[] = [
        'title' => childText($item, 'title', 'NO TITLE PROVIDED'),
        'link' => childText($item, 'link', 'NO LINK PROVIDED'),
        'description' => $full !== '' ? $full : childText($item, 'description', 'NO DESCRIPTION PROVIDED'),
        'pubDate' => childText($item, 'pubDate', 'NO DATE PROVIDED'),
        'guid' => childText($item, 'guid', 'NO GUID PROVIDED'),
    ];
}
if (!$results) respondError('No RSS articles found.', 422);
echo json_encode($results, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_UNICODE);
