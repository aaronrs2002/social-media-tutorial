import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import DeleteUser from "./components/DeleteUser";
import Theme from "./components/Theme";
import ChangePassword from "./components/ChangePassword";
import uuid from "./components/uuid";
import SaveTheme from "./components/SaveTheme";
import MainContent from "./components/MainContent";
import User from "./components/User";
import Banner from "./components/Banner";
import Validate from "./components/Validate.js";


function App() {
  let [userEmail, setUserEmail] = useState(null);
  let [newUserType, setUserType] = useState(false);
  let [isValidUser, setValidUser] = useState(false);
  let [token, setToken] = useState("");
  let [alert, setAlert] = useState("default");
  let [alertType, setAlertType] = useState("danger");
  let [checkedToken, setTokenCk] = useState(false);
  let [infoMessage, toggleInfo] = useState("");
  let [avatar, setAvatar] = useState("./img/profileImg.jpg");
  let [banner, setBanner] = useState(
    "./img/banner.jpg"
  );
  let [newUser, setNewUser] = useState(false);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  const showAlert = (theMessage, theType) => {
    setAlertType((alertType) => theType);
    setAlert((alert) => theMessage);
    setTimeout(() => {
      setAlert((alert) => "default");
    }, 5000);
  };

  //START VALIDATE USER
  const validateUser = (success, token, email, msg) => {
    if (success === 1) {
      setValidUser((isValidUser) => true);
      setToken((token) => token);
      sessionStorage.setItem("token", token);
      setTokenCk((checkedToken) => true);
      setUserEmail((userEmail) => email);
      sessionStorage.setItem("email", email);
      axios.get("/theme/" + email).then(
        (res) => {
          if (res.data[0].theme) {
            SaveTheme(res.data[0].theme);
          } else {
            SaveTheme("css/bootstrap.min.css");
          }
        },
        (error) => {
          console.log(error);
        }
      );
      //FRON END GET AVATAR
      axios.get("/avatar/" + email).then(
        (res) => {
          if (res.data[0].avatar) {
            setAvatar((avatar) => res.data[0].avatar);
          } else {
            setAvatar((avatar) => "./img/profileImg.jpg");
          }
        },
        (error) => {
          console.log(error);
        }
      );
      //FRONT END GET BANNER
      axios.get("/banner/" + email).then(
        (res) => {
          if (res.data[0].banner) {
            setBanner((banner) => res.data[0].banner);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      setValidUser((isValidUser) => false);
      setToken((token) => token);
      setUserEmail((userEmail) => null);
      showAlert("That didn't work: " + msg, "danger");
    }
  };
  ///END VALIDATE USER


  //START CREATE USER
  const createUser = () => {
    //  event.preventDefault();
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    axios
      .post(
        "/newUser",
        { theme: "css/bootstrap.min.css", email: email, password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(
        (res) => {
          showAlert("User created succussfully!", "success");
          setUserType((newUserType) => false);
          document.querySelector("button.ckValidate").classList.remove("hide");
          localStorage.removeItem('email');
          localStorage.removeItem('password');
        },
        (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      );
  };
  //END CREATE USER

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
            showAlert("That didn't work: " + res.data.data, "danger")
          }
        },
        (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )

    }
  }


  //START LOG OUT
  const logout = () => {
    setValidUser((isValidUser) => false);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");

    axios
      .put("/logout-uuid/", {
        email: userEmail,
        uuid: "logged-out: " + uuid(),
      })
      .then(
        (res) => {
          console.log("res from logout: " + res);
        },
        (error) => {
          showAlert(
            "Something happened while logging out: : " + error,
            "danger"
          );
        }
      );
  };
  //END LOG OUT

  //START REFRESH
  useEffect(() => {
    /*  if (userEmail === null) {
      validateUser(1, "dev pass", "aaron@test.com", "dev work");
    }*/

    if (sessionStorage.getItem("token") && checkedToken === false) {
      axios.get("/check-token/" + sessionStorage.getItem("email"), config).then(
        (res) => {
          try {
            if (sessionStorage.getItem("token") === res.data[0].token) {
              validateUser(
                1,
                res.data[0].token,
                sessionStorage.getItem("email"),
                "token success"
              );
            }
          } catch (error) {
            console.error(error);
            return false;
          }
        },
        (error) => {
          showAlert("That token-request didn't work: " + error, "danger");
          logout();
        }
      );
    }
  });
  //END REFRESH

  return (
    <React.Fragment>
      {" "}
      {alert !== "default" ? (
        <div
          id="messageAlert"
          className={"alert alert-" + alertType + " animated fadeInUp"}
          role="alert"
        >
          {alert}
        </div>
      ) : null}
      {isValidUser === true ? null : (
        <Login
          login={login}
          createUser={createUser}
          setNewUser={setNewUser}
          newUser={newUser}
          showAlert={showAlert}
        />
      )}
      <main>

        <div>
          {isValidUser === true ? (
            <React.Fragment>
              <Banner avatar={avatar} banner={banner} />
              <MainContent
                userEmail={userEmail}
                avatar={avatar}
                showAlert={showAlert}
                config={config}
              />
            </React.Fragment>
          ) : null}
        </div>
      </main>
      {isValidUser === true ? (
        <footer className="footer mt-auto py-3 px-3 bg-dark text-muted">
          <div className="row">
            <div className="col-md-6">
              {infoMessage === "account-settings" ? (
                <a
                  href="#settingsPanel"
                  className="btn btn-secondary w-50"
                  onClick={() => toggleInfo((infoMessage) => "")}
                >
                  {userEmail} <i className="fas fa-cog"></i>
                </a>
              ) : (
                <a
                  href="#settingsPanel"
                  className="btn btn-secondary w-50"
                  onClick={() =>
                    toggleInfo((infoMessage) => "account-settings")
                  }
                >
                  {userEmail} <i className="fas fa-cog"></i>
                </a>
              )}
              {infoMessage === "account-settings" ? (
                <div id="settingsPanel" className="py-2">
                  <div className="row">
                    <div className="col-md-6">
                      {" "}
                      <label>Settings:</label>
                      <ul className="noStyle">
                        <li>
                          {" "}
                          <Theme userEmail={userEmail} showAlert={showAlert} config={config} />
                        </li>
                        <li>
                          <ChangePassword showAlert={showAlert} />
                        </li>
                        <li>
                          <DeleteUser
                            userEmail={userEmail}
                            logout={logout}
                            showAlert={showAlert}
                            infoMessage={infoMessage}
                          />
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <label>User</label>
                      <User
                        userEmail={userEmail}
                        showAlert={showAlert}
                        setAvatar={setAvatar}
                        avatar={avatar}
                        setBanner={setBanner}
                        banner={banner}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="col-md-4"></div>
            <div className="col-md-2">
              <button className="btn btn-block btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </footer>
      ) : null}{" "}
    </React.Fragment>
  );
}

export default App;
