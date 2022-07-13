const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");

//SERVER SIDE VIEW FEEDS
router.get("/:email", (req, res) => {
    let sql = `SELECT * FROM feeds WHERE email = '${req.params.email}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result)
        }
    });
});

//SERVER SIDE ADD FEED
router.post("/add-feed", checkToken, (req, res) => {
    let feed = {
        email: req.body.email,
        address: req.body.address,
        id: req.body.id
    };
    let sql = `INSERT INTO feeds SET ?`;
    let query = db.query(sql, feed, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//SERVER SIDE DELETE FEED
router.delete("/remove-feed/:id", checkToken, (req, res) => {
    let sql = `DELETE FROM feeds WHERE id = '${req.params.id}'`;
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