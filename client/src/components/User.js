import React, { useEffect, useState } from "react";
import axios from "axios";

function User(props) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  function updateAvatar() {
    let avatar = "./img/profileImg.jpg";

    try {
      if (document.querySelector("[name='avatar']").value) {
        avatar = document.querySelector("[name='avatar']").value;
      }
    } catch (err) {
      console.log("Error: " + err);
    }
    if (avatar !== "./img/profileImg.jpg") {
      axios
        .put(
          "/update-avatar",
          {
            email: props.userEmail,
            avatar,
          },
          config
        )
        .then(
          (res) => {
            props.setAvatar((update) => avatar);
            props.showAlert("Avatar changed!", "success");
            document.querySelector("[name='avatar']").value = "";
          },
          (error) => {
            props.showAlert(
              "That avatar change didn't work: " + error,
              "danger"
            );
          }
        );
    }
  }

  function updateBanner() {
    let banner = "default";

    try {
      if (document.querySelector("[name='banner']").value) {
        banner = document.querySelector("[name='banner']").value;
      }
    } catch (err) {
      console.log("Error: " + err);
    }
    if (banner !== "default") {
      axios
        .put(
          "/update-banner",
          {
            email: props.userEmail,
            banner,
          },
          config
        )
        .then(
          (res) => {
            console.log(
              "JSON.stringify(res.data): " + JSON.stringify(res.data)
            );
            props.setBanner((update) => banner);
            props.showAlert("Banner changed!", "success");
            document.querySelector("[name='banner']").value = "";
          },
          (error) => {
            props.showAlert(
              "That banner change didn't work: " + error,
              "danger"
            );
          }
        );
    }
  }

  return (
    <ul className="noStyle">
      <li>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Avatar image address/url"
            name="avatar"
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => updateAvatar()}
            >
              Update Avatar
            </button>
          </div>
        </div>
      </li>

      <li>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Banner image address/url"
            name="banner"
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => updateBanner()}
            >
              Update Banner
            </button>
          </div>
        </div>
      </li>


    </ul>
  );
}

export default User;
