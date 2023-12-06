import React, { useState, useEffect } from "react";
import themesList from "./ThemesList";
import SaveTheme from "./SaveTheme"
import axios from "axios";

const Theme = (props) => {



  function changeTheme(whichTheme) {
    if (whichTheme === "themeSelect") {
      whichTheme = document.querySelector("#theme").value;
    }

    axios
      .put(
        "/edit-theme/",
        {
          email: sessionStorage.getItem("email"),
          theme: whichTheme,
        },
        props.config
      )
      .then(
        (res) => {
          SaveTheme(whichTheme);
          props.showAlert("Theme changed!", "success");
        },
        (error) => {
          props.showAlert("That theme change didn't work: " + error, "danger");
        }
      );
  }


  return (
    <div>

      <select
        className="form-control py-2"
        id="theme"
        onChange={changeTheme.bind(this, "themeSelect")}
      >
        <option value="css/bootstrap.min.css">Select Bootswatch Theme</option>
        {themesList
          ? themesList.map((theme, i) => {
            return (
              <option value={themesList[i]} key={i}>
                {"Theme: " +
                  themesList[i].substring(25, themesList[i].lastIndexOf("/"))}
              </option>
            );
          })
          : null}
      </select>
    </div>
  );
};

export default Theme;
