import React, { useState, useEffect } from "react";
import axios from "axios";
import parse from 'html-react-parser';
import timestamp from "./timestamp";
import uuid from "./uuid";
import Validate from "./Validate";
import CryptoJS from 'crypto-js';//https://github.com/brix/crypto-js
import paths from "./config/paths";


const Stage = (props) => {
  let [loaded, setLoaded] = useState(false);
  let [originalConvos, setOriginalConvos] = useState([]);
  let [conversation, setConversation] = useState([]);
  let [contactList, setContactList] = useState([]);

  //CLIENT SIDE SELECT POST
  function selectPost(whichPost, initiator, recipient) {
    if (props.userEmail !== recipient) {
      document.querySelector("input[name='email']").value = recipient;
    }
    if (props.userEmail !== initiator) {
      document.querySelector("input[name='email']").value = initiator;
    }
    whichPost = whichPost.toString();
    const post = document.querySelector(".list-group-item[data-post='" + whichPost + "']");
    const ckMark = document.querySelector("div[data-post='" + whichPost + "'] .fa-check-circle");
    if (document.querySelector(".active.list-group-item[data-post='" + whichPost + "']")) {
      post.classList.remove("active");
      ckMark.classList.remove("fas");
      ckMark.classList.add("far");
      document.querySelector("input[value='" + whichPost + "']").checked = false;
    } else {
      post.classList.add("active");
      ckMark.classList.remove("far");
      ckMark.classList.add("fas");
      document.querySelector("div[data-post='" + whichPost + "] .fa-check-circle'");
      document.querySelector("input[value='" + whichPost + "']").checked = true;
    }
  }

  //CLIENT SIDE GET DATA
  function runConvo() {

    axios.get("/api/messages/" + props.userEmail, props.config).then(
      (response) => {
        console.log("response.status: " + response.status + " (typeof response.status): " + (typeof response.status));
        if (response.status) {
          if (response.status >= 400 && response.status < 500) {
            props.showAlert("HTTP MESSAGES RESPONSE STATUS: " + response.status + " Log back in please.", "warning");
            props.logout();
          }
          if (response.status >= 500) {
            props.showAlert("HTTP MESSAGES RESPONSE STATUS: " + response.status + " Log back in please.", "danger");
            props.logout();
          }
        }

        if (response.data == "zero messages") {
          setConversation((conversation) => [{
            "message": "Hello " + props.userEmail + " you have no messages.",
            "uuid": "84c7f005-bf7a-47c7-b66d-eca6631ee43e",
            "initiator": "aaron@web-presence.biz",
            "timestamp": "2022-06-01_PM-02:21:39",
            "avatar": "https://avatars.githubusercontent.com/u/3018791?s=460&u=c8e2caafc97d45fdfc2a97d13acfc2749a6c61fb&v=4",
            "recipient": "aaron@web-presence.biz"
          }]);
          return false;
        }

        response = response.data;
        setConversation((conversation) => response);
        setOriginalConvos((originalConvos) => response);
        let tempContacts = [];
        for (let i = 0; i < response.length; i++) {
          const initiator = response[i].initiator.replace("-viewed", "");
          const recipient = response[i].recipient.replace("-viewed", "");
          if (initiator !== props.userEmail && tempContacts.indexOf(initiator) === -1) {
            tempContacts.push(initiator);
          }
          if (recipient !== props.userEmail && tempContacts.indexOf(recipient) === -1) {
            tempContacts.push(recipient);
          }
        }
        setContactList((contactList) => tempContacts);
      }, (error) => {
        console.log(error);
        props.showAlert("Error" + error.message + " - To avoid this, use the \"Log Out\" button at the end of each session.", "warning");
        props.logout();
      }
    )
  }

  //CLIENT SIDE POST MESSAGE
  function postData(data) {

    axios.post("/api/messages/post-message", data, props.config).then(
      (res) => {
        runConvo()
      }, (error) => {
        console.log(error);
        props.showAlert("that didn't work: " + error, "danger");
      }
    )
  }

  //CLIENT SIDE BUILD MESSAGE OBJECT
  function sendMessage() {
    Validate(["email", "message"]);
    let message = "";
    if (document.querySelector(".error")) {
      props.showAlert("Both email and message fields need to be filled out.", "danger");
      return false;
    } else {
      message = document.getElementById("message").value;
      message = message.replace(/'/g, "&#39;").replace(/’/g, "&#39;");

      let theTime = timestamp();

      let encryptMessage = CryptoJS.AES.encrypt(JSON.stringify(message), paths[0].phrase + theTime).toString();

      postData({
        avatar: props.avatar,
        initiator: props.userEmail,
        message: encryptMessage,
        recipient: document.querySelector("input[name='email']").value,
        timestamp: theTime,
        uuid: uuid()
      });
      document.getElementById("message").value = "";
    }
  }


  //CLIENT SIDE CLEAR CONVERSATIONS
  function clearConvo() {
    let selectIds = [];
    let tempConversation = [];
    [].forEach.call(document.querySelectorAll("input[name='message']"), function (e) {
      if (e.checked === true) {
        selectIds.push(e.value);
      }
    });

    for (let i = 0; i < conversation.length; i++) {
      if (selectIds.indexOf(conversation[i].uuid) !== -1) {
        let initiator = conversation[i].initiator;
        if (props.userEmail === initiator) {
          initiator = props.userEmail + "-viewed";
        }
        let recipient = conversation[i].recipient;
        if (props.userEmail === recipient) {
          recipient = props.userEmail + "-viewed";
        }

        const editedData = {
          initiator,
          recipient,
          uuid: conversation[i].uuid,
        }

        if (initiator.indexOf("-viewed") !== -1 && recipient.indexOf("-viewed") !== -1) {
          axios.delete("/api/messages/remove-message/" + conversation[i].uuid, props.config).then(
            (res) => {
              runConvo()
            }, (error) => {
              console.log(error);
              props.showAlert("That didn't work: " + error, "danger");
            }
          )
        } else {
          axios.put("/api/messages/viewed", editedData, props.config).then(
            (res) => {
              runConvo();
            }, (error) => {
              console.log(error);
              props.showAlert("That didn't work: " + error, "danger");
            }
          )
        }
      }
    }
    setConversation((conversation) => []);
  }

  //FILTER CONTACTS
  const filterContacts = () => {
    const viewContact = document.getElementById("activeContacts").value;
    let tempList = [];
    if (viewContact === "default") {
      for (let i = 0; i < originalConvos.length; i++) {
        tempList.push(originalConvos[i])
      }
      setConversation((conversation) => tempList);
    } else {
      document.querySelector("input[name='email']").value = viewContact.replace("-viewed", "");
      for (let i = 0; i < originalConvos.length; i++) {
        const initiator = originalConvos[i].initiator.replace("-viewed", "");
        const recipient = originalConvos[i].recipient.replace("-viewed", "");
        if (viewContact === initiator || viewContact === recipient) {
          tempList.push(originalConvos[i]);
        }
      }
      setConversation((conversation) => tempList);
    }
  }

  useEffect(() => {
    if (loaded === false && props.userEmail !== null) {
      runConvo();
      setLoaded((loaded) => true);
    }
    const interval = setInterval(() => runConvo(), 10000);
    return () => {
      clearInterval(interval);
    }
  });

  console.log("conversation.length: " + conversation.length);
  return (<div className="row">
    <h2>Message Network users</h2>
    <div className="col-6 p-0">
      <input type="text" className="form-control" name="email" placeholder="Contact Email" />
    </div>
    <div className="col-6 p-0">
      <select className="form-control" id="activeContacts" onChange={() => filterContacts()}>
        <option value="default">All Contacts</option>
        {contactList ? contactList.map((contact, i) => {
          return (<option value={contact} key={i}>{contact}</option>)
        }) : null}
      </select>
    </div>
    <div className="col-md-12 list-group p-0" id="stage">
      {conversation.length > 0 ?
        conversation.map((convo, i) => {


          let decryptMessage = parse(convo.message);
          decryptMessage = decryptMessage.toString();
          let testCrypto = CryptoJS.AES.decrypt(decryptMessage, paths[0].phrase + convo.timestamp);


          try {
            if (testCrypto.toString(CryptoJS.enc.Utf8)) {
              testCrypto = testCrypto.toString(CryptoJS.enc.Utf8);
              if (testCrypto) {
                decryptMessage = testCrypto;
              }
            }
          } catch (error) {
            console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
          }






          return (<div key={i}
            className="list-group-item-action pointer list-group-item"
            onClick={() => selectPost(convo.uuid, convo.initiator.replace("-viewed", ""), convo.recipient.replace("-viewed", ""))}
            data-post={convo.uuid}
          >
            <div className="d-flex flex-nowrap justify-content-between">
              <div className="order-md-1 pr-2">
                <img className="avatarIcon" src={convo.avatar} />
              </div>
              <div className="order-md-2">
                <ul className="list-unstyled">
                  <li>
                    {"From: " + convo.initiator + ": " + decryptMessage}
                  </li>
                  <li>
                    <small><i>{"To: " + convo.recipient.replace("-viewed", "") + ":" + convo.timestamp}</i></small>
                  </li>
                </ul>
              </div>
              <div className="order-md-3">
                <h4><input type="checkbox" name="message" className="hide" value={convo.uuid} /><i className="far fa-check-circle"></i></h4>
              </div>
            </div>
          </div>)
        })
        : null}
    </div>
    <div className="btn-group form-control" role="group" aria-label="Control Panel">
      <button className="btn btn-success" onClick={() => sendMessage()}>Send Message</button>
      <button className="btn btn-success" onClick={() => clearConvo()}>Clear Selected</button>
    </div>
    <hr />
    <textarea id="message" name="message" className="form-control"></textarea>
  </div>)



}

export default Stage;
