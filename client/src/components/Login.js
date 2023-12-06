import React, { useState, useEffect } from "react";
import Validate from "./Validate";
import timestamp from "./timestamp.js"
import paths from "./config/paths"

const Login = (props) => {

  let [timeDate, setTimeDate] = useState(null);
  let [randNumID, setRandNumID] = useState("");
  let [signUpTime, setSignUpTime] = useState("");
  let [email, setEmail] = useState("");
  let [loaded, setLoaded] = useState(false);
  let [newUsers, setNewUsers] = useState([]);

  let [confirmAddress, setConfirmAddress] = useState(paths.confirmAddress);
  let [checkUUID, setCheckUUID] = useState(paths.checkUUID);


  function checkConfirmations(uniqueID) {

    fetch(checkUUID + "?uuid=" + uniqueID)
      .then((response) => response.json())
      .then(
        (data) => {
          if (data === uniqueID) {
            props.createUser();
          } else {
            props.showAlert(data + " is not recognized.", "danger")
          }
        },
        (error) => {
          console.log("fetch error: " + error);

        }
      );

  }



  function getParams() {

    let url = window.location;
    let urlVals = {};
    (url + "?")
      .split("?")[1]
      .split("&")
      .forEach(function (pair) {
        pair = (pair + "=").split("=").map(decodeURIComponent);
        if (pair[0].length) {
          urlVals[pair[0]] = pair[1];
          if (pair[0] === "uuid") {
            setRandNumID((randNumID) => pair[1]);
            checkConfirmations(pair[1]);

          }
          if (pair[0] === "timestamp") {
            setSignUpTime((signUpTime) => pair[1]);
          }
          if (pair[0] === "email") {
            setEmail((email) => pair[1]);
          }

          if (pair[0] === "confirm") {
            if (localStorage.getItem("password")) {
              props.showAlert("THAT WORKED! Go check your email account to finish the process. MUST USE SAME COMPUTER YOU STARTED ON.", "success");
            }
          }

        }
      });
  }


  function prepInfo() {
    setTimeDate((timeDate) => timestamp());


  }

  const onHandleChange = (e) => {
    if (document.querySelector("button.ckValidate.hide")) {
      document.querySelector("button.ckValidate").classList.remove("hide");
    }

    if (props.newUser === false) {
      Validate(["email", "password"]);
    } else {
      Validate(["email", "password1", "password2"]);
      prepInfo();
    }
  };

  function ckNewPassword() {
    localStorage.setItem("email", document.querySelector("input[name='email']").value.toLowerCase());
    localStorage.setItem("password", document.querySelector("input[name='password2']").value);
    onHandleChange();

    const pass1 = document.querySelector("input[name='password1']").value;
    let pass2 = "";
    if (document.querySelector("input[name='password2']").value) {
      pass2 = document.querySelector("input[name='password2']").value;
    }
    if (pass1 === pass2) {
      document.querySelector("button[name='newUser']").disabled = false;
    } else {
      document.querySelector("button[name='newUser']").disabled = true;
    }
  }


  useEffect(() => {
    if (loaded === false) {
      getParams();
      setLoaded((loaded) => true);
    }
  });


  //MUST CHANGE .htaccess and php cors between envirionments

  return (
    <div className="col-md-12">

      <div className="loginForm">
        {props.newUser === false ? (
          <React.Fragment>
            <h2>Sign in</h2>
            <form onSubmit={props.login}>
              <input
                type="text"
                className="form-control"
                name="email"
                placeholder="Email"
                maxLength="255"
                onChange={onHandleChange}
              />
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="password"
                maxLength="50"
                onChange={onHandleChange}
              />
              <button
                type="submit"
                className="btn w-100 btn-success ckValidate hide"
              >
                Login
              </button>
            </form>
            <small>
              <a href="#" onClick={() => props.setUserType(true)}>
                Don't have an account? Click here.
              </a>
            </small>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h2>Create Account</h2>
            <form method="POST" action={confirmAddress}>

              <input
                type="text"
                className="form-control"
                name="email"
                placeholder="Email"
                maxLength="255"
                onChange={onHandleChange}
              />
              <input
                type="password"
                className="form-control"
                name="password1"
                placeholder="password"
                maxLength="50"
                onChange={ckNewPassword}
              />
              <input
                type="password"
                className="form-control"
                name="password2"
                placeholder="password"
                maxLength="50"
                onChange={ckNewPassword}
              />

              <input type="hidden" name="timestamp" value={timeDate} />


              <button
                className="btn w-100 btn-success ckValidate hide"
                name="newUser"
                type="submit"

              >
                Create User
              </button>
            </form>
            <i>
              <a href="#" onClick={() => props.setUserType(false)}>
                Already have an account
              </a>
            </i>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default Login;