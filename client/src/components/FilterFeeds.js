import React, { useState, useEffect } from "react";
import axios from "axios";

const FilterFeeds = (props) => {
  let [loaded, setLoaded] = useState(false);


  /*CLIENT SIDE GRAB REMOVE LIST*/
  const getRemoveList = () => {

    axios.get("/get-list/" + props.userEmail, props.config).then(
      (res) => {

        let listArr = [];
        if (res.data[0].removeList === null) {
          listArr = ["tempDataEmpty"];
        } else {
          listArr = res.data[0].removeList.split(",").map(function (a) {
            return a.trim();
          });
        }
        console.log("listArr: " + listArr);
        props.setRemoveList((removeList) => listArr);
        props.takeOutFeeds(listArr);


      }, (error) => {
        console.log(error);
      }
    );

  }

  /*CLIENT SIDE UPPDATE REMOVE LIST*/
  function updateRemoveList(list) {


    let remove = "default";
    const field = document.querySelector("input[name='remove']");
    if (field.value && field.value.length !== undefined) {
      remove = field.value;
      list.push(field.value);
    }
    if (list !== undefined && list.length > 0) {
      axios.put("/edit-list", {
        removeList: list.toString(),
        email: props.userEmail
      }, props.config).then(
        (res) => {
          field.value = "";
          props.setRemoveList((removeList) => list);

          getRemoveList();
        }, (error) => {
          console.log(error);
        }

      )
    }
  }

  /*CLIENT SIDE DELETE WORD*/
  function deleteWord(word) {
    let tempData = [];
    for (let i = 0; i < props.removeList.length; i++) {
      if (props.removeList[i] !== word) {
        tempData.push(props.removeList[i]);
      }
    }

    if (tempData.length === 0) {
      tempData = ["tempDataEmpty"];
    }
    props.setRemoveList((removeList) => tempData);
    updateRemoveList(tempData); //deleting the word is an update in this case
    props.takeOutFeeds(tempData);
  }

  useEffect(() => {
    if (props.userEmail !== null && loaded !== true) {
      setTimeout(() => {
        getRemoveList();
      }, 1000)

      setLoaded((loaded) => true);
    }
  });


  return (
    <div className="row">
      <div className="col-md-12">
        <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="Remove feeds regarding..." name="remove" />
          <button className="btn btn-outline-secondary" onClick={() => updateRemoveList(props.removeList)}>Remove</button>

        </div>
      </div>
      <div className="col-md-12">
        {props.removeList.length !== 0 ? (<label>Remove feeds with these "buzz words."</label>) : null}
      </div>
      <ul className="inline">
        {props.removeList.length !== 0 ?
          props.removeList.map((word, i) => {
            if (word !== "tempDataEmpty") {
              return (
                <li key={i}>
                  <button className="btn btn secondary mx-1 my-1" onClick={() => deleteWord(word)}>
                    {word + " "}
                    <i className="fas fa-times-circle"></i>
                  </button>
                </li>)
            }
          })
          : null}

      </ul>
      <div className="mb-5">Feeds currently hidden:{props.hiddenFeeds}</div>

    </div>
  )

}
export default FilterFeeds;
