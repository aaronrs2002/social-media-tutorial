import React, { useState, useEffect } from "react";
import themesList from "./ThemesList";
//import SaveTheme from "./SaveTheme";
import axios from "axios";


const Theme = (props) => {

    function changeTheme() {
        let whichTheme = document.querySelector("#theme").value;
        console.log("whichTheme: " + whichTheme);
        axios.put("/edit-theme", {
            email: props.userEmail,
            theme: whichTheme
        }, props.config).then(
            (res) => {
                localStorage.setItem("theme", whichTheme);
                document.querySelector("link[data-bootswatch='true']").setAttribute("href", whichTheme);
                props.showAlert("Theme Changed!", "success");
            }, (error) => {
                props.showAlert("Theme Change failed.", "danger");
            }
        );
    }

    return (
        <div>
            <select className="form-control py-2" id="theme" onChange={() => changeTheme()}>
                <option value="css/bootstrap.min.css">Select Bootswatch Theme</option>
                {themesList ?
                    themesList.map((theme, i) => {
                        return (<option value={themesList[i]} key={i}>{"Theme: " + themesList[i].substring(25, themesList[i].lastIndexOf("/"))}</option>)
                    })
                    : null}
            </select>
        </div>);
};

export default Theme;