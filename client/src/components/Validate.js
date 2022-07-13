const Validate = (fields) => {
    if (document.querySelectorAll(".error")) {
        [].forEach.call(document.querySelectorAll(".error"), function (e) {
            e.classList.remove("error");
        })
    }

    for (let i = 0; i < fields.length; i++) {
        let value;
        let element = document.querySelector("[name='" + fields[i] + "']");
        if (element !== null) {
            value = element.value
        } else {
            value = ""
        }
        if (value === "" || value === "default") {
            document.querySelector("[name='" + fields[i] + "']").classList.add("error");
        } else {
            document.querySelector("[name='" + fields[i] + "']").classList.remove("error");
        }

        let listOfEmailFields = ["email"];

        console.log("fields[i]: " + fields[i]);

        if (listOfEmailFields.indexOf(fields[i]) !== -1) {
            const email = document.querySelector("[name='" + fields[i] + "']").value;
            let atpos = email.indexOf("@");
            let dotpos = email.lastIndexOf(".");
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
                document.querySelector("[name='" + fields[i] + "']").classList.add("error");
            } else {
                document.querySelector("[name='" + fields[i] + "']").classList.remove("error");
            }
        }


    }
}

export default Validate;