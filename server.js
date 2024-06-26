const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const db = require("./config/db");
const { checkToken } = require("./auth/token_validation");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const jwtKey = require("./config/jwt-key");

const app = express();

app.use(bodyParser.json());

//START CREATE USER
const create = (data, callback) => {
  db.query(
    `insert into user(email,theme,password)
                      values(?,?,?)`,
    [data.email, data.theme, data.password],
    (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    }
  );
};

app.post("/newUser", (req, res) => {
  const body = req.body;

  console.log("JSON.stringify(req.body): " + JSON.stringify(req.body));


  const salt = genSaltSync(10);
  body.password = hashSync(body.password, salt);
  create(body, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: 0,
        message: "There was 500 error: " + err,
      });
    }
    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
});

//END CREATE USER


/////////////////////////////START LOGIN
/*
const saveToken = (token, email) => {
  let sql = `UPDATE user SET token = '${token}' WHERE email = "${email}"`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.log("There was an error on the server side: " + err);
    } else {
      console.log(
        "That worked. here is the token result: " + JSON.stringify(result)
      );
      // res.send(result);
    }
  });
};*/

const getUserByUserEmail = (email, callback) => {
  db.query(
    `select * from user where email = ?`,
    [email],
    (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results[0]);
    }
  );
};

app.post("/login", (req, res) => {
  const body = req.body;
  getUserByUserEmail(body.email, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (!results) {
      return res.json({
        success: 0,
        data: "Invalid email or password NO RESULTS: " + body.email,
      });
    }
    const result = compareSync(body.password, results.password);
    if (result) {
      results.password = undefined;
      const jsontoken = sign(
        {
          result: results,
        },
        jwtKey,
        {
          expiresIn: "1h",
        }
      );

      if (jsontoken) {
        //  let sql = `UPDATE user SET token = '${jsontoken}' WHERE email = "${body.email}"`;
        let query = db.query(
          `UPDATE user SET token = ? WHERE email = ?`,
          [jsontoken, body.email],
          (err, result) => {
            if (err) {
              console.log("There was an error on the server side: " + err);
            } else {
              console.log(
                "That worked. here is the token result: " + JSON.stringify(result)
              );
              // res.send(result);
            }
          });
        console.log("trying to fire saved token.");
      }

      return res.json({
        success: 1,
        message: "Login successful",
        token: jsontoken,
        id: results.id,
      });
    } else {
      return res.json({
        success: 0,
        data: "Invalid email or password COMPARISON FAIL",
      });
    }
  });
});

//////////////////////////////END LOGIN

//START LOGOUT
// replace token with unique id so tokens cannot be used after logout
app.put("/logout-uuid", checkToken, (req, res) => {
  /* let tempuUuid = req.body.uuid.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '');
   let tempEmail = req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '');
   let sql = `UPDATE user SET token = '${tempuUuid}' WHERE email = "${tempEmail}"`;*/
  let query = db.query(
    `UPDATE user SET token = ? WHERE email = ?`,
    [req.body.uuid, req.body.email],
    (err, result) => {
      if (err) {
        res.send("Setting logout token failed: " + err);
      } else {
        console.log("JSON.stringify(result): " + JSON.stringify(result));
        let sql = `UPDATE user SET token = '${tempuUuid}' WHERE email = "${tempEmail}"`;
        let query = db.query(sql, (err, result) => {
          if (err) {
            console.log("There was an error on the server side: " + err);
          } else {
            console.log(
              "That worked. here is the token result: " + JSON.stringify(result)
            );
            // res.send(result);
          }
        });
        res.send("logout uuid saved.");
      }
    });
});

//END LOG OUT

//SERVER SIDE START GET BANNER
app.get("/banner/:email", checkToken, (req, res) => {
  // let sql = `SELECT banner FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT banner FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
});

//SERVER SIDE END GET BANNER

//SERVER SIDE CHANGE BANNER
app.put("/update-banner", checkToken, (req, res) => {
  // let sql = `UPDATE user SET banner = '${req.body.banner.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}' WHERE email = "${req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}"`;
  let query = db.query(
    `UPDATE user SET banner = ? WHERE email = ?`,
    [req.body.banner, req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
});

//SERVER SIDE END CHANGE BANNER

//SERVER SIDE START GET AVATAR
app.get("/avatar/:email", checkToken, (req, res) => {
  // let sql = `SELECT avatar FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT avatar FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
});

//SERVER SIDE END GET AVATAR

//SERVER SIDE CHANGE AVATAR
app.put("/update-avatar", checkToken, (req, res) => {
  // let sql = `UPDATE user SET avatar = '${req.body.avatar.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}' WHERE email = "${req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}"`;
  let query = db.query(
    `UPDATE user SET avatar = ? WHERE email = ?`,
    [req.body.avatar, req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
});

//SERVER SIDE END CHANGE AVATAR

//START DELETE USER
app.delete("/delete-user/:email", checkToken, (req, res) => {
  // let sql = "DELETE FROM user WHERE email = '" + req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '') + "'";
  let query = db.query(
    "DELETE FROM user WHERE email = ?",
    [req.params.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(req.params);
      }
    });
});
//END DELETE USER


//USER EDIT THEME START

app.put("/edit-theme/", checkToken, (req, res) => {
  //let sql = `UPDATE user SET theme = '${req.body.theme.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}' WHERE email = "${req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}"`;
  let query = db.query(
    `UPDATE user SET theme = ? WHERE email = ?`,
    [req.body.theme, req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
});

//USER EDIT THEME END

//START GET THEME
app.get("/theme/:email", checkToken, (req, res) => {
  //let sql = `SELECT theme FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT theme FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
});

//END GET THEME

/*START REMOVE LIST OPTION*/

app.get("/get-list/:email", checkToken, (req, res) => {
  //let sql = `SELECT removeList FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT removeList FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
        res.send(results);
      }
    });
});

app.put("/edit-list", checkToken, (req, res) => {
  //let sql = `UPDATE user SET removeList = '${req.body.removeList.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'  WHERE email = '${req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `UPDATE user SET removeList = ?  WHERE email = ?`,
    [req.body.removeList, req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result.removeList);
      }
    });
});

/*END REMOVE LIST OPTION*/

/*START NETWORK LIST*/

app.get("/get-network/:email", checkToken, (req, res) => {
  //let sql = `SELECT network FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT network FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
        res.send(results);
      }
    });
});

app.put("/edit-network", checkToken, (req, res) => {
  // let sql = `UPDATE user SET network = '${req.body.network.replace(/[&\/\\#+()$~%*?<>“]/g, '')}'  WHERE email = '${req.body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `UPDATE user SET network = ?  WHERE email = ?`,
    [req.body.network, req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {

        res.send(result);
      }
    });
});

/*END NETWORK LIST*/

/*START WHOS FOLLOWING QUERY*/

//SELECT CHARINDEX('t', 'Tusomer') AS MatchPosition;
/*END WHO'S FOLLOWING QUERY*/

//START REFRESH

app.get("/check-token/:email", checkToken, (req, res) => {
  // let sql = `SELECT token FROM user WHERE email = '${req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
  let query = db.query(
    `SELECT token FROM user WHERE email = ?`,
    [req.params.email],
    (err, results) => {
      if (err) {
        console.log("Checked for token, got this error: " + err);
      } else {
        res.send(results);
      }
    });
});

//END REFRESH

//CHANGE PASSWORD START

app.put("/change-password", checkToken, (req, res) => {
  const body = req.body;
  const salt = genSaltSync(10);
  body.password = hashSync(body.password, salt);
  //let sql = `UPDATE user SET password = '${body.password}' WHERE email = "${body.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}"`;
  let query = db.query(
    `UPDATE user SET password = ? WHERE email = ?`,
    [body.password, body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
});

//END CHANGE PASSWORD
//ROUTES
app.use("/api/feeds/", require("./routes/api/feeds"));
app.use("/api/favorites/", require("./routes/api/favorites"));
app.use("/api/messages/", require("./routes/api/messages"));

/*END DEV MODE- */

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  console.log(process.env.JWT_KEY)

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`You fired up PORT ${PORT}`));
