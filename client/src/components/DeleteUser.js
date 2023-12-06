import React, { useState, useEffect } from "react";
import axios from "axios";

const DeleteUser = (props) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  let [infoMessage, setInfoMessage] = useState("");

  const deleteUser = () => {
    axios.delete("/delete-user/" + props.userEmail, config).then(
      (res) => {
        if (res.data.email === sessionStorage.getItem("email")) {
          props.showAlert(JSON.stringify(res.data.email) + " was deleted succesfully!", "success");
          props.logout();
        }
      },
      (error) => {
        props.showAlert("That did not work: " + error, "danger");
      }
    );
  };

  console.log("infoMessage: " + infoMessage);

  return (

    <div >
      {infoMessage === "" ? (
        <button
          className="btn btn-danger btn-block"
          onClick={() => setInfoMessage((infoMessage) => "delete-user")}
        >
          Delete User
        </button>) : null}
      {infoMessage === "delete-user" ? (
        <div className="alert alert-danger" role="alert">
          Are you sure you want to delete {props.userEmail}?
          <button className="btn btn-block btn-danger" onClick={() => deleteUser()}>
            Yes
            </button>
          <button
            className="btn btn-block btn-secondary"
            onClick={() => setInfoMessage((infoMessage) => "")}
          >
            No
            </button>
        </div>
      ) : null}
    </div>

  );
};

export default DeleteUser;
