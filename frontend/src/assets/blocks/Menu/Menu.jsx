import React, { useContext } from "react";
import { BiSolidAddToQueue, BiSolidChat, BiSolidLogIn } from "react-icons/bi";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { AuthContext, TranslationContext } from "../../contexts/contexts";

export default function Menu({ isOnTop, switchMenu }) {
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);

  return (
    <div
      style={isOnTop ? { top: "30px" } : { bottom: "30px" }}
      className="menu"
    >
      {user != "unAuth" ? (
        <Link to="/chats">
          <button className="flex">
            <BiSolidChat />
          </button>
        </Link>
      ) : (
        <Link to="/login">
          <button className="flex">
            <BiSolidLogIn />
          </button>
        </Link>
      )}
      <Tooltip id="admin-tooltip" />
      <Tooltip id="verified-tooltip" />
      <button onClick={switchMenu} className="logo-btn">
        <img className="logo" src="/static/catuser.png" alt="logo" />
      </button>
      {user != "unAuth" ? (
        <Link to={user ? "/user/" + user.username : ""}>
          <button>{t("me")}</button>
        </Link>
      ) : (
        <Link to="/signup">
          <button className="flex">
            <BiSolidAddToQueue />
          </button>
        </Link>
      )}
    </div>
  );
}
