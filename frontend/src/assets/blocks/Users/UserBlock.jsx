import React, { useContext } from "react";
import { BiSolidChat, BiSolidCog } from "react-icons/bi";
import { Link } from "react-router-dom";
import { AuthContext, TranslationContext } from "../../contexts/contexts";

export default function UserBlock({ user }) {
  const { t } = useContext(TranslationContext);
  const me = useContext(AuthContext);
  return (
    <Link to={user ? "/user/" + user.username : ""}>
      <div className="flex user">
        <div className="flex">
          <img src="/static/catuser.png" alt="" />
          <div className="flex data">
            <h2>{user ? user.username : ""}</h2>
            <p>{t("testdesc")}</p>
          </div>
        </div>
        {me && user && user.username == me.username ? (
          <Link to="/settings">
            <button>
              <BiSolidCog />
            </button>
          </Link>
        ) : (
          <Link to={user ? "/chat/" + user.username : ""}>
            <button>
              <BiSolidChat />
            </button>
          </Link>
        )}
      </div>
    </Link>
  );
}
