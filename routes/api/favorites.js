const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");

//SERVER SIDE VIEW FAVORITES
router.get("/:email", (req, res) => {
    let sql = `SELECT guid FROM favorites WHERE email = '${req.params.email}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result)
        }
    });
});

//SERVER SIDE ADD FAVORITE
router.post("/add-favorite", checkToken, (req, res) => {
    let favorite = {
        email: req.body.email,
        guid: req.body.guid,
        favoriteID: req.body.favoriteID
    };
    let sql = `INSERT INTO favorites SET ?`;
    let query = db.query(sql, favorite, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//SERVER SIDE DELETE FAVORITE
router.delete("/remove-favorite/:favoriteID", checkToken, (req, res) => {
    let sql = `DELETE FROM favorites WHERE favoriteID = '${req, params.favoriteID}'`;

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