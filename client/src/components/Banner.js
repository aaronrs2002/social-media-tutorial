import React, { useEffect, useState } from "react";

function Banner(props) {
  return (
    <div
      className="jumbotron jumbotron-fluid"
      style={{
        backgroundImage: "url(" + props.banner + ")",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div id="avatarWrap">
        <div
          id="avatar"
          style={{
            backgroundImage: "url(" + props.avatar + ")",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
    </div>
  );
}

export default Banner;
