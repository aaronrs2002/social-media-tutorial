const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");

//SERVER VIEW FAVORITES
router.get("/:email", checkToken, (req, res) => {
  let sql = `SELECT guid FROM favorites WHERE email = '${req.params.email}'`;
  let query = db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//SERVER ADD FAVORITE
router.post("/add-favorite", checkToken, (req, res) => {
  let favorite = {
    email: req.body.email,
    guid: req.body.guid,
    favoriteID: req.body.favoriteID,
  };
  let sql = "INSERT INTO favorites SET ?";
  let query = db.query(sql, favorite, (err, result) => {
    if (err) {
      console.log("What tha error?" + err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

//SERVER DELETE FEED
router.delete("/remove-favorite/:favoriteID", checkToken, (req, res) => {
  let sql = `DELETE FROM favorites WHERE favoriteID = "${req.params.favoriteID}"`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

module.exports = router;
