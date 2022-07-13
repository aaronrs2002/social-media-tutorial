const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");

//SERVER SIDE VIEW MESSAGES
router.get("/:userEmail", checkToken, (req, res) => {
    const userEmail = req.params.userEmail;
    let sql = `SELECT * FROM messages WHERE initiator = '${userEmail}' OR recipient = '${userEmail}' ORDER BY timestamp`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result)
        }
    });
});

//SERVER SIDE ADD MESSAGE
router.post("/post-message", checkToken, (req, res) => {
    let message = {
        avatar: req.body.avatar,
        initiator: req.body.initiator,
        message: req.body.message,
        recipient: req.body.recipient,
        timestamp: req.body.timestamp,
        uuid: req.body.uuid
    };
    let sql = `INSERT INTO messages SET ?`;
    let query = db.query(sql, message, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});


//SERVER SIDE VIEWED BY USER
router.put("/viewed", checkToken, (req, res) => {
    let sql = `UPDATE messages SET  recipient = '${req.body.recipient}', initiator = '${req.body.initiator}' WHERE uuid = '${req.body.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result)
        }
    });
});






//SERVER SIDE DELETE MESSAGE    
router.delete("/remove-message/:uuid", checkToken, (req, res) => {
    let sql = `DELETE FROM messages WHERE uuid = '${req, params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result)
        }
    });
});

module.exports = router;