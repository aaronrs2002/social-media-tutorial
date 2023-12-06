const Validate = (fields) => {
  if (document.querySelectorAll(".error"))
    [].forEach.call(document.querySelectorAll(".error"), function (e) {
      e.classList.remove("error");
    });

  for (let i = 0; i < fields.length; i++) {
    var value,
      element = document.querySelector("input[name='" + fields[i] + "']");
    if (element != null) {
      value = element.value;
    } else {
      value = "";
    }
    if (value === "") {
      document
        .querySelector("input[name='" + fields[i] + "']")
        .classList.add("error");
    } else {
      document
        .querySelector("input[name='" + fields[i] + "']")
        .classList.remove("error");
    }


    if (fields[i] === "email" || fields[i] === "follow") {
      const email = document.querySelector("[name='" + fields[i] + "']").value;
      var atpos = email.indexOf("@");
      var dotpos = email.lastIndexOf(".");
      if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
        document
          .querySelector("[name='" + fields[i] + "']")
          .classList.add("error");
      } else {
        document
          .querySelector("input[name='" + fields[i] + "']")
          .classList.remove("error");
      }
    }
  }

  if (document.querySelector("button.ckValidate")) {
    if (document.querySelector(".error")) {
      document.querySelector("button.ckValidate").disabled = true;
      return false;
    } else {
      document.querySelector("button.ckValidate").disabled = false;
    }
  }
};

export default Validate;
