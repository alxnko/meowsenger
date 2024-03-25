import React, { useContext } from "react";
import { Link } from "react-router-dom";
import IsNotAuth from "../assets/blocks/Auth/IsNotAuth";
import Footer from "../assets/blocks/Footer";
import { TranslationContext } from "../assets/contexts/contexts";

export default function Main() {
  const { t } = useContext(TranslationContext);
  return (
    <div>
      <IsNotAuth />
      <div className="center">
        <h1>meowsenger</h1>
        <br />
        <div>
          <p>
            <Link to="/login">
              <button>{t("login")}</button>
            </Link>
              or  
            <Link to="/signup">
              <button>{t("signup")}</button>
            </Link>
          </p>
        </div>
        <br />
        <h2>why?</h2>
        <div>
          <button className="chat-prev">
            <h2>{t("mainPrivate")}</h2>
            <p>{t("mainPrivateDesc")}</p>
          </button>
          <button className="chat-prev right">
            <h2>{t("mainSecure")}</h2>
            <p>{t("mainSecureDesc")}</p>
          </button>
          <button className="chat-prev">
            <h2>{t("mainAnonymity")}</h2>
            <p>{t("mainAnonymityDesc")}</p>
          </button>
        </div>
        <br />
        <Footer />
      </div>
    </div>
  );
}
