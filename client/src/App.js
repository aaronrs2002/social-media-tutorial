import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import DeleteUser from "./components/DeleteUser";
import MainContent from "./components/MainContent";
import uuid from "./components/uuid";
import Validate from "./components/Validate.js";
import Theme from "./components/Theme";
import SaveTheme from "./components/SaveTheme";
import User from "./components/User";
import Banner from "./components/Banner";

function App() {
  let [loaded, setLoaded] = useState(false);
  let [userEmail, setUserEmail] = useState(null);
  let [isValidUser, setIsValidUser] = useState(false);
  let [token, setToken] = useState("");
  let [alert, setAlert] = useState("default");
  let [alertType, setAlertType] = useState("danger");
  let [checkedToken, setCheckedToken] = useState(false);
  let [infoMessage, setInfoMessage] = useState("");
  let [newUser, setNewUser] = useState(false);
  let [avatar, setAvatar] = useState("./img/profile.jpg");
  let [banner, setBanner] = useState("./img/banner.jpg");

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }

  const showAlert = (theMessage, theType) => {
    setAlertType((alertType) => theType);
    setAlert((alert) => theMessage);
    setTimeout(() => {
      setAlert((alert) => "default");
    }, 3000)
  }


  //CLIENT SIDE VALIDATE USER
  const validateUser = (success, tokenPass, email, msg) => {
    if (success === 1) {
      setIsValidUser((isValidUser) => true);
      setToken((token) => tokenPass);
      sessionStorage.setItem("token", tokenPass);
      setCheckedToken((setCheckedToken) => true);
      setUserEmail((userEmail) => email);
      sessionStorage.setItem("email", email);
      //CLIENT SIDE GET THEME 
      axios.get("/theme/" + email).then(
        (res) => {
          if (res.data[0].theme) {
            SaveTheme(res.data[0].theme);
          } else {
            SaveTheme("css/bootstrap.min.css");
          }
        }, (error) => {
          console.log(error);
        }
      );
      //CLIENT SIDE GET AVATAR   
      axios.get("/avatar/" + email).then(
        (res) => {
          if (res.data[0].avatar) {
            setAvatar((avatar) => res.data[0].avatar);
          } else {
            setAvatar((avatar) => "./img/profileImg.jpg");
          }
        }, (error) => {
          console.log(error);
        }
      );
      //CLIENT SIDE GET BANNER
      axios.get("/banner/" + email).then(
        (res) => {
          if (res.data[0].banner) {
            setBanner((banner) => res.data[0].banner);
          } else {
            setBanner((banner) => "./img/banner.jpg");
          }
        }, (error) => {
          console.log(error);
        }
      );


    } else {
      setIsValidUser((isValidUser) => false);
      setToken((token) => tokenPass);
      sessionStorage.removeItem("token");
      setUserEmail((userEmail) => null);
      showAlert("That didn't work: " + msg, "danger");
    }
  }


  //CLIENT SIDE CREAT USER
  const createUser = () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");


    axios.post("/newUser",
      { "email": email, "theme": "css/bootstrap.min.css", "password": password },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success !== 0) {
            setNewUser((newUser) => false);
            if (document.querySelector("button.ckValidate")) {
              document.querySelector("button.ckValidate").classList.remove("hide");
            }
            showAlert(email + " has been added", "success");
            localStorage.removeItem("email");

          } else {
            showAlert("That didn't work: " + res.data.message, "danger");
          }

        }, (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )
  }


  //CLIENT SIDE START LOGIN 
  const login = () => {
    setUserEmail((userEmail) => null);
    Validate(["email", "password"]);

    if (document.querySelector(".error")) {
      showAlert("There is an error in your form.", "danger");
      return false
    } else {
      const email = document.querySelector("input[name='email']").value.toLowerCase();
      const password = document.querySelector("input[name='password']").value;

      axios.post("/login", { email, password }, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success === 1) {
            showAlert(email + " logged in.", "success");
            validateUser(res.data.success, res.data.token, email, "logged in");
            localStorage.removeItem("password");
          } else {
            showAlert("That didn't work: " + res.data.succes, "danger")
          }
        },
        (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )

    }
  }


  //CLIENT SIDE START LOG OUT
  const logout = () => {
    setIsValidUser((isValidUser) => false);
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("token");

    axios.put("/logout-uuid", {
      email: userEmail,
      uuid: "logged-out" + uuid()
    }).then(
      (res) => {
        console.log("logged out");
      }, (error) => {
        showAlert("Something happend while logging out: " + error, "danger");
      })

  }

  //START REFRESH
  useEffect(() => {

    if (sessionStorage.getItem("token") && checkedToken === false) {
      axios.get("/check-token/" + sessionStorage.getItem("email"), config).then(
        (res) => {
          try {
            if (sessionStorage.getItem("token") === res.data[0].token) {
              validateUser(1, res.data[0].token, sessionStorage.getItem("email"), "token success");
            }
          } catch (error) {
            console.log("error: " + error);
            return false
          }
        }, (error) => {
          showAlert("That token request didn't work: " + error, "danger");
          logout();

        }

      )
    }
  });



  return (
    <React.Fragment>
      {alert !== "default" ?
        <div className={"alert alert-" + alertType + " animated fadeInDown"} role="alert">{alert}</div>
        : null}
      {isValidUser === false ?
        <Login setNewUser={setNewUser} newUser={newUser} login={login} createUser={createUser} />
        :
        <React.Fragment>

          <div className="container my-5">
            <Banner avatar={avatar} banner={banner} />
            <MainContent userEmail={userEmail} avatar={avatar} showAlert={showAlert} config={config} />
          </div>
          <footer className="footer mt-auto py-3 px-3 bg-dark text-muted">
            <div className="row">
              <div className="col-md-4">
                {infoMessage === "account-settings" ?
                  <a href="#settingsPanel" className="btn btn-secondary  btn-block" onClick={() => setInfoMessage((infoMessage) => "")} >{userEmail} <i className="fas fa-cog"></i></a>
                  : <a href="#settingsPanel" className="btn btn-secondary  btn-block" onClick={() => setInfoMessage((infoMessage) => "account-settings")} >{userEmail} <i className="fas fa-cog"></i></a>}

                <div id="settingsPanel" className="py-2">
                  {infoMessage === "account-settings" ?
                    <React.Fragment>
                      <label>Settings: </label>
                      <ul className="list-unstyled">
                        <li><Theme userEmail={userEmail} showAlert={showAlert} config={config} /></li>
                        <li>
                          <ChangePassword showAlert={showAlert} config={config} />
                        </li>
                        <li>
                          <DeleteUser validateUser={validateUser} config={config} userEmail={userEmail} logout={logout} showAlert={showAlert} infoMessage={infoMessage} />
                        </li>

                      </ul></React.Fragment> : null}
                </div>

              </div>

              <div className="col-md-4">
                {infoMessage === "account-settings" ? (<ul>
                  <li className="list-unstyled">
                    <User userEmail={userEmail} showAlert={showAlert} setAvatar={setAvatar} avatar={avatar} setBanner={setBanner} banner={banner} config={config} />
                  </li>
                </ul>) : null}
              </div>


              <div className="col-md-4">
                <button className="btn btn-block btn-danger" onClick={() => logout()}>Logout</button>
              </div>
            </div>
          </footer>
        </React.Fragment>
      }
    </React.Fragment>
  );

}

export default App;
