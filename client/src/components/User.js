import React from "react";
import axios from "axios";

function User(props) {

    //CLIENT SIDE UPDATE AVATAR
    function updateAvatar() {
        let avatar = "./img/profileImg.jpg";
        try {
            if (document.querySelector("[name='avatar']").value) {
                avatar = document.querySelector("[name='avatar']").value;
            }
        } catch (err) {
            console.log(err);
        }

        if (avatar !== "./img/profileImg.jpg") {
            axios.put("/update-avatar", {
                email: props.userEmail,
                avatar
            }, props.config).then(
                (res) => {
                    props.setAvatar((update) => avatar);
                    props.showAlert("Avatar changed!", "success");
                    document.querySelector("[name='avatar']").value = "";
                }, (error) => {
                    props.showAlert("Avatar change failed: " + error, "success");
                }
            )
        }
    }

    //CLIENT SIDE UPDATE BANNER
    function updateBanner() {
        let banner = "deafult";
        try {
            if (document.querySelector("[name='banner']").value) {
                banner = document.querySelector("[name='banner']").value;
            }
        } catch (err) {
            console.log(err);
        }

        if (banner !== "deafult") {
            axios.put("/update-banner", {
                email: props.userEmail,
                banner
            }, props.config).then(
                (res) => {
                    props.setBanner((update) => banner);
                    props.showAlert("Banner changed!", "success");
                    document.querySelector("[name='banner']").value = "";
                }, (error) => {
                    props.showAlert("Banner change failed: " + error, "success");
                }
            )
        }

    }


    return (<ul className="list-unstyled mt-5">
        <li><label>Custom Banner and Avatar</label></li>
        <li>
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Avatar image address/url" name="avatar" />
                <div className="input-group-append">
                    <button className="btn btn-secondary" onClick={() => updateAvatar()}>Update Avatar</button>
                </div>
            </div>
        </li>
        <li>
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Banner image address/url"
                    name="banner" />
                <div className="input-group-append">
                    <button className="btn btn-secondary" onClick={() => updateBanner()}>Update Banner</button>
                </div>
            </div>
        </li>
    </ul>);

}
export default User;