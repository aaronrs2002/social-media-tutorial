import React, { useState, useEffect } from "react";
import axios from "axios";

const ChangePassword = (props) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  const changePassword = () => {
    const newPasswordElem = document.querySelector(
      "input[name='new-password']"
    );
    let newPassword = "";
    if (newPasswordElem) {
      newPassword = newPasswordElem.value;
    }

    if (newPassword !== "") {
      axios
        .put(
          "/change-password",
          config,
          {
            email: sessionStorage.getItem("email"),
            password: document.querySelector("input[name='new-password']")
              .value,
          }
        )
        .then(
          (res) => {
            props.showAlert("Password changed successfully", "success");
            document.querySelector("input[name='new-password']").value = "";
          },
          (error) => {
            props.showAlert("Password change didn't work: " + error, "danger");
          }
        );
    } else {
      newPasswordElem.classList.add("error");
      props.showAlert('Please input something into the "New Password" field.', "danger");
    }
  };

  return (
  
    
        <div className="form-group py-2">
    
          <input
            type="password"
            name="new-password"
            className="form-control"
            placeholder="New Password"
          />
          <button
            type="submit"
            className="btn btn-block btn-danger ckValidate "
            onClick={changePassword}
          >
            Change Password
          </button>
        </div>
 
  );
};

export default ChangePassword;
