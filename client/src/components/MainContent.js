import React, { useState, useEffect } from "react";
import axios from "axios";
import uuid from "./uuid";
import Network from "./Network";
import parse from 'html-react-parser';
import Stage from "./Stage";
import FilterFeeds from "./FilterFeeds";
import paths from "./config/paths";


const MainContent = (props) => {
  let [loaded, setLoaded] = useState(false);
  let [obj, setObj] = useState([]);
  let [filteredObj, setFilteredObj] = useState([]);
  let [show, setShow] = useState("");
  let [active, setActive] = useState();
  let [filter, setFilter] = useState("");
  let [whosFeed, setWhosFeed] = useState("default");
  let [removeList, setRemoveList] = useState([]);
  let [addresses, setAddresses] = useState([]);
  let [activeID, setActiveID] = useState();
  let [hiddenFeeds, setHiddenFeeds] = useState(0);
  let [favorites, setFavorites] = useState([]);
  let [search, setSearch] = useState("");
  let [showAll, setShowAll] = useState(true);



  function toggle(item) {
    setShow((show) => item);
  }

  /*START GET FAVORITES*/
  function grabFavorites(feedEmail) {
    axios.get("/api/favorites/" + feedEmail, props.config).then(
      (res) => {
        let tempData = [];
        for (let i = 0; i < res.data.length; i++) {
          tempData.push(res.data[i].guid);
          setFavorites((favorites) => tempData);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /*END GET FAVORITES*/

  /*START ADDING/DELETING FAVORITES*/
  function favorite(guid) {
    if (favorites.indexOf(guid) === -1) {
      axios
        .post(
          "/api/favorites/add-favorite",
          {
            guid,
            email: props.userEmail,
            favoriteID: props.userEmail + "-" + guid.replace(/\//g, "-"),
          },
          props.config
        )
        .then(
          (res) => {
            grabFavorites(props.userEmail);
            props.showAlert("Recomended by: " + props.userEmail, "success");
          },
          (error) => {
            props.showAlert("That didn't work: " + error, "danger");
          }
        );
    } else {
      axios
        .delete(
          "/api/favorites/remove-favorite/" +
          props.userEmail +
          "-" +
          guid.replace(/\//g, "-"),

          props.config
        )
        .then(
          (res) => {
            let tempData = [];
            for (let i = 0; i < favorites.length; i++) {
              if (guid !== favorites[i]) {
                tempData.push(favorites[i]);
              }
            }
            setFavorites((favorites) => tempData);

            grabFavorites(props.userEmail);
          },
          (error) => {
            console.log("That favorite didn't work: " + error, "danger");
          }
        );
    }
  }

  function searchBuzzWord() {
    toggle("");
    const searchFor = document.querySelector("input[name='filter']").value;
    setSearch((search) => searchFor);
  }


  function grabData(id, address) {

    setObj((obj) => []);
    fetch(paths[0].rssEndpoint + address
    )

      .then((response) => response.json())
      .then(
        (data) => {
          setObj((obj) => data);
        },

        (error) => {
          console.log("fetch error: " + error);
        }
      ).then(

        setActive((active) => address),
        setActiveID((activeID) => id),
        setShow((show) => "")
      );


  }

  ///GET FEED LIST
  function grabFeedList() {
    let userFeed = props.userEmail;
    if (sessionStorage.getItem("lastFeed")) {
      userFeed = sessionStorage.getItem("lastFeed");
    }
    setWhosFeed((whosFeed) => userFeed);
    axios.get("/api/feeds/" + userFeed, props.config).then(
      (res) => {
        /* if (res.status) {
           let alertType = "info";
           if (res.status == 200) {
             alertType = "success";
           }
           if (res.status >= 400 && res.status < 500) {
             alertType = "warning";
           }
           if (res.status >= 500) {
             alertType = "danger";
           }
           props.showAlert("HTTP FEED RESPONSE STATUS: " + res.status, alertType);
         }*/
        let tempData = [];
        for (let i = 0; i < res.data.length; i++) {
          tempData.push(res.data[i]);
        }
        setAddresses((addresses) => tempData);
        grabData(tempData[0].id, tempData[0].address);
        grabFavorites(userFeed);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function AddFeed() {
    var feedURL = "default";
    const field = document.querySelector("input[name='add-feed-url']");

    if (field.value && field.value.length !== undefined) {
      feedURL = field.value;
      field.classList.remove("error");
    } else {
      console.log("no value");
      field.classList.add("error");
    }

    if (feedURL !== "default") {
      axios
        .post(
          "/api/feeds/add-feed",
          {
            email: props.userEmail,
            address: feedURL,
            id: props.userEmail + "-" + uuid(),
          },
          props.config
        )
        .then(
          (res) => {
            grabFeedList();
            field.value = "";
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  //DELETE feed
  function removeFeed(id) {
    axios
      .delete(
        "/api/feeds/remove-feed/" + id,

        props.config
      )
      .then(
        (res) => {
          grabFeedList();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  function loadList(user) {
    sessionStorage.setItem("lastFeed", user);
    setWhosFeed((whosFeed) => user);
    grabFeedList();
    grabFavorites();
  }

  function takeOutFeeds(theRemoveList) {
    let tempFeedNum = 0;
    let tempObj = [];
    let takeOutNums = [];

    for (let j = 0; j < obj.length; j++) {
      if ((typeof obj[j].title) !== "string") {
        obj[j].title = "Missing Title";
      }
      if ((typeof obj[j].description) !== "string") {
        obj[j].description = "Missing Description";
      }
      let content = obj[j].title.toLowerCase() + obj[j].description.toLowerCase();
      for (let i = 0; i < theRemoveList.length; i++) {
        if (content.toLowerCase().indexOf(theRemoveList[i].toLowerCase()) !== -1) {
          tempFeedNum = tempFeedNum + 1;
          takeOutNums.push(j);
        }

      }

    }

    for (let i = 0; i < obj.length; i++) {
      if (takeOutNums.indexOf(i) === -1) {
        tempObj.push(obj[i]);
      }

    }

    setFilteredObj((filteredObj) => tempObj);
    setHiddenFeeds((hiddenFeeds) => tempFeedNum);

    return false;

  }


  useEffect(() => {
    if (loaded === false && props.userEmail !== null) {
      setLoaded((loaded) => true);
      grabFeedList();
    }


    setLoaded((loaded) => true);
  }, []);


  return (
    <div className="container my-5" id="infoPanel">
      <div className="row">
        <div className="col-md-8">
          <h2>Active Feed Address:</h2>
          <h4>
            {whosFeed === props.userEmail ? (
              <React.Fragment>
                <button
                  className="btn btn-danger"
                  onClick={() => setShow((show) => "remove-feed")}
                  title="Remove this feed"
                  alt="Remove this feed"
                >
                  <i className="fa fa-trash "></i>
                </button>
                <span className="activeAddress">{active ? active : null}</span>
                {show === "remove-feed" ? (
                  <div className="alert alert-danger">
                    Are you sure you want to delete this feed from your list?
                    <div className="btn-group form-control" role="group">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeFeed(activeID)}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShow((show) => "")}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            ) : (
              <span className="activeAddress">{active ? active : null}</span>
            )}
          </h4>
          <input
            type="text"
            placeholder="Search feed for"
            name="filter"
            className="form-control my-3"
            onChange={() => searchBuzzWord()}
          />{" "}
          <ul className="list-group mb-5">
            {filteredObj.length !== 0 ?

              filteredObj.map((post, i) => {

                let theContent = post.title.toLowerCase() + post.description.toLowerCase();

                if (theContent.indexOf(search) !== -1 || search.length === 0) {
                  return (
                    <React.Fragment key={i}>
                      {show === post.title ?
                        <React.Fragment>
                          <li className="list-group-item active"
                            data-filter={i}
                            onClick={() => toggle("")}
                          >{post.title + " "}
                            {favorites.indexOf(post.guid) !== -1 ? <small><i className="fas fa-heart"></i> - {whosFeed}</small> : null}
                          </li>


                          <div className="card"  >
                            <div className="card-body">
                              <div>{parse(post.description)}</div>
                              {(<i
                                onClick={() => favorite(post.guid)}
                                className="far fa-heart pointer"
                              ></i>)}
                            </div>

                            <div className="card-footer text-muted">
                              {post.pubDate.substring(0, post.pubDate.lastIndexOf(":")) + "  "}
                              <a href={post.link} target="_blank">View Original Post</a>
                            </div>

                          </div>
                        </React.Fragment>
                        : <li key={i} data-filter={i} className="list-group-item"

                          onClick={() => toggle(post.title)}
                        >
                          {post.title}
                          {favorites.indexOf(post.guid) !== -1 ? (<small><i className="fas fa-heart"></i>--{whosFeed}</small>) : null}

                        </li>}
                    </React.Fragment>)
                } else {
                  console.log("search: " + search + " - theContent.indexOf(search): " + theContent.indexOf(search))
                }


              })
              : <div><h4><i>Loading...</i></h4>
                <div className="loader p-5"></div></div>}

          </ul>
        </div>

        <div className="col-md-4">
          <h2>{whosFeed + " - "} Feeds</h2>
          <ul className="list-group mb-5">
            {addresses !== [] ?
              addresses.map((feedOBJ, i) => {
                return (
                  <a key={i}
                    href="#"
                    className={
                      active === feedOBJ.address
                        ?
                        "list-group-item list-item-action aactive" :
                        "list-group-item list-group-item-action"
                    }
                    onClick={() => grabData(feedOBJ.id, feedOBJ.address)}
                  >
                    {feedOBJ.address.replace("https://", "").replace("http://", "").substring(0, 46)}
                  </a>
                )
              })
              : null}
            {whosFeed === props.userEmail ?
              (<li className="list-group-item">
                <div className="input-group mb-3">
                  <input type="text" className="form-control" placeholder="Feed Address/URL" name="add-feed-url" />
                  <button className="btn btn-success" onClick={() => AddFeed()}> Add Feed</button>
                </div>
              </li>)
              : null}
          </ul>

          <Network
            loadList={loadList}
            userEmail={props.userEmail}
            avatar={props.avatar}
            whosFeed={whosFeed}
            config={props.config}
          />
          {obj.length > 0 ?
            <FilterFeeds
              showAlert={props.showAlert}
              removeList={removeList}
              setRemoveList={setRemoveList}
              setFilter={setFilter}
              filter={filter}
              setShow={setShow}
              show={show}
              userEmail={props.userEmail}
              takeOutFeeds={takeOutFeeds}
              hiddenFeeds={hiddenFeeds}
              config={props.config}

            /> : null}
          <Stage
            avatar={props.avatar}
            userEmail={props.userEmail}
            showAlert={props.showAlert}
            config={props.config}
            logout={props.logout}
          />

        </div>

      </div>
    </div>
  );
};

export default MainContent;
