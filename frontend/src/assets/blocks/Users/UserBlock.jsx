import React, { useContext } from "react";
import {
  BiSolidChat,
  BiSolidCog,
  BiSolidShield,
  BiSolidShieldPlus,
  BiSolidShieldX,
  BiSolidUserX,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import UserBadges from "./UserBadges";

export default function UserBlock({
  user,
  isChat,
  isGroup,
  isUserAdmin,
  isAdmin,
  isOwner,
  remove,
  addAdmin,
  removeAdmin,
}) {
  const { t } = useContext(TranslationContext);
  const me = useContext(AuthContext);
  return (
    <>
      <div className="flex user">
        <Link to={user ? "/user/" + user.username : ""}>
          <div className="flex">
            <img
              className="user-block-image"
              src="/static/catuser.png"
              alt=""
            />
            <div className="flex data">
              <h2>
                {user ? user.username : ""}
                {user && isUserAdmin ? (
                  <BiSolidShield style={{ color: "yellow" }} className="no" />
                ) : (
                  ""
                )}
                <UserBadges user={user} />
              </h2>
              <p>
                {user && user.desc != "default" ? user.desc : t("testdesc")}
              </p>
            </div>
          </div>
        </Link>
        {!isChat && me.user && user && user.username == me.user.username ? (
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
      {isGroup && me.user && me.user.username != user.username && isAdmin ? (
        <div className="flex-center user">
          {isOwner ? (
            isUserAdmin ? (
              <a>
                <button onClick={removeAdmin ? removeAdmin : {}}>
                  <BiSolidShieldX />
                </button>
              </a>
            ) : (
              <a>
                <button onClick={addAdmin ? addAdmin : {}}>
                  <BiSolidShieldPlus />
                </button>
              </a>
            )
          ) : (
            ""
          )}
          <a>
            <button onClick={remove ? remove : {}}>
              <BiSolidUserX />
            </button>
          </a>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
