import React, { useContext } from "react";
import { Link } from "react-router-dom";
import IsNotAuth from "../assets/blocks/Auth/IsNotAuth";
import Footer from "../assets/blocks/Footer";
import { TranslationContext } from "../assets/contexts/contexts";

export default function Main() {
  const { t } = useContext(TranslationContext);
  return (
    <div className="main-page">
      <IsNotAuth />
      <div className="center">
        <h1>meowsenger</h1>
        <br />
        <div>
          <p>
            <Link to="/login">
              <button>{t("login")}</button>
            </Link>
            {" " + t("or") + " "}
            <Link to="/signup">
              <button>{t("signup")}</button>
            </Link>
          </p>
        </div>
        <br />
        <h2>{t("why")}?</h2>
        <div>
          <button className="chat-prev flex">
            <div>
              <h2>{t("mainPrivate")}</h2>
              <p>{t("mainPrivateDesc")}</p>
            </div>
            <img className="main-img" src="/static/catuser.png" alt="" />
          </button>
          <button className="chat-prev flex right">
            <img className="main-img" src="/static/catuser.png" alt="" />
            <div>
              <h2>{t("mainSecure")}</h2>
              <p>{t("mainSecureDesc")}</p>
            </div>
          </button>
          <button className="chat-prev flex">
            <div>
              <h2>{t("mainAnonymity")}</h2>
              <p>{t("mainAnonymityDesc")}</p>
            </div>
            <img className="main-img" src="/static/catuser.png" alt="" />
          </button>
        </div>
        <br />
        <Footer />
      </div>
    </div>
  );
}
