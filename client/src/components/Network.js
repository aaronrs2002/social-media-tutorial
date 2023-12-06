import React, { useState, useEffect } from "react";
import axios from "axios";
import Validate from "./Validate";

const Network = (props) => {
  let [loaded, setLoaded] = useState(false);
  let [networkList, setNetworkList] = useState([]);
  let [show, setShow] = useState("");
  let [warning, setWarning] = useState("");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };
  /*GRAB NETWORKLIST*/
  const getNetworkList = () => {
    axios.get("/get-network/" + props.userEmail).then(
      (res) => {
        if (res.data[0].network !== null) {
          let listArr = res.data[0].network.split(",").map(function (a) {
            return a.trim();
          });

          setNetworkList((networkList) => listArr);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  //UPDATE NETWORKLIST
  function updateNetworkList(list) {
    if (show !== "removeUser") {
      Validate(["follow"]);
    }
    if (document.querySelector(".error[name='follow']")) {
      return false;
    } else {
      const field = document.querySelector("input[name='follow']");
      if (field.value && field.value.length !== undefined) {
        list.push(field.value);
      }

      if (list !== undefined && list.length > 0) {
        axios
          .put(
            "/edit-network",
            {
              network: list.toString(),
              email: props.userEmail,
            },
            config
          )
          .then(
            (res) => {
              console.log(res);
              document.querySelector("input[name='follow']").value = "";
              setNetworkList((networkList) => list);
              getNetworkList();
              setWarning((warning) => "");
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  //END UPDATE REMOVELIST

  //START DELETE USER FROM NETWORK
  function deleteUser(networkUser) {
    let tempData = [];
    for (let i = 0; i < networkList.length; i++) {
      if (networkList[i] !== networkUser) {
        tempData.push(networkList[i]);
      }
    }
    setNetworkList((networkList) => tempData);
    updateNetworkList(tempData); //deleting a word is a list update, in this case.
    //props.takeOutFeeds();
  }

  useEffect(() => {
    if (props.userEmail !== null && loaded !== true) {
      getNetworkList();
      setLoaded((loaded) => true);
    }
  });
  return (
    <div id="feedNetwork">
      <h2>Feed Network</h2>
      {networkList.length > 0 ?
        <label>

          {show === "removeUser" ? (
            <button className="btn btn-link" onClick={() => setShow((show) => "")}>
              (Leave Edit Mode)
            </button>
          ) : (
            <button className="btn btn-link"
              onClick={() => setShow((show) => "removeUser")}
            >
              (Edit Network)
            </button>
          )}

        </label> : null}

      <ul className="list-group mb-5">
        <button
          className={
            props.whosFeed === props.userEmail
              ? "list-group-item list-group-item-action active"
              : "list-group-item list-group-item-action"
          }
          onClick={() => props.loadList(props.userEmail)}
        >
          {" "}
          {props.userEmail}
        </button>
        {networkList !== [] && show !== "removeUser"
          ? networkList.map((user, i) => {
            return (
              <a
                href="#"
                key={i}
                className={
                  props.whosFeed === user
                    ? "list-group-item list-group-item-action active"
                    : "list-group-item list-group-item-action"
                }
                onClick={() => props.loadList(user)}
              >
                {" "}
                {user}
              </a>
            );
          })
          : null}

        {networkList !== [] && show === "removeUser"
          ? networkList.map((user, i) => {
            return (
              <React.Fragment>
                <a
                  href="#feedNetwork"
                  className={
                    props.whosFeed === user
                      ? "list-group-item list-group-item-action active"
                      : "list-group-item list-group-item-action"
                  }
                  onClick={() => setWarning((warning) => "remove-" + user)}
                >
                  {" "}
                  <i className="fa fa-trash "></i> {" " + user}
                </a>
                {warning === "remove-" + user ? (
                  <div className="alert alert-danger">
                    Are you sure you want to delete {user}?
                    <div className="btn-group form-control" role="group">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => deleteUser(user)}
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setWarning((warning) => "")}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })
          : null}

        <li className="list-group-item">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Follow"
              name="follow"
            />
            <div className="input-group-append">
              <button
                className="btn btn-success"
                onClick={() => updateNetworkList(networkList)}
                type="button"
              >
                Follow
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Network;
