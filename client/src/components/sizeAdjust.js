const sizeAdjust = () => {
  let height = window.innerHeight;
  if (document.getElementById("stage")) {
    document.getElementById("stage").style.height = height - 250 + "px";
  }
};

window.addEventListener("resize", sizeAdjust);
//window.load = sizeAdjust();

export default sizeAdjust;
