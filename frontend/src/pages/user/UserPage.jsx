import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import UserBadges from "../../assets/blocks/Users/UserBadges";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";
export default function UserPage() {
  const { t } = useContext(TranslationContext);
  const { user, fetchUser } = useContext(AuthContext);
  const { setIsLoader } = useContext(LoaderContext);
  const [thisUser, setThisUser] = useState(undefined);
  let isItMe = undefined;
  const { username } = useParams();
  const navigate = useNavigate();

  const adminEdit = (action) => {
    fetch(
      "/api/u/admin_edit",
      createPostData({ id: thisUser.id, action: action })
    ).then(() => {
      console.log(isItMe);
      if (isItMe) {
        fetchUser();
      } else updatePage();
    });
  };

  const updatePage = () => {
    setIsLoader(true);
    isItMe = user && user.username == username;
    if (isItMe) {
      setThisUser(user);
      setIsLoader(false);
    } else if (user) {
      fetchThisUser();
    }
  };

  useEffect(() => {
    setIsLoader(true);
    updatePage();
  }, [user, navigate]);

  const fetchThisUser = () => {
    fetch("/api/u/get_user/" + username)
      .then((res) => {
        if (res.status != "200") {
          return { status: false, reason: "network" };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status && "user" in data) {
          setThisUser(data.user);
          setIsLoader(false);
        } else if ("reason" in data && data.reason == "network") {
          setIsLoader(true);
        } else {
          navigate(user ? "/user/" + user.username : "/chats");
        }
      });
  };

  return (
    <div>
      <IsAuth />
      <div className="flex">
        <img className="user-block-image" src="/static/catuser.png" alt="" />
        <div className="flex data">
          <h2 style={{ fontSize: "24px" }}>
            {thisUser ? thisUser.username : ""}
            <UserBadges user={thisUser} />
          </h2>
          <p>{user && user.desc != "default" ? user.desc : t("testdesc")}</p>
        </div>
      </div>
      <Link to={thisUser ? "/chat/" + thisUser.username : ""}>
        <button className="chat-prev center">{t("openchat")}</button>
      </Link>
      {thisUser && user == thisUser ? (
        <Link to="/settings">
          <button className="chat-prev center">{t("settings")}</button>
        </Link>
      ) : (
        ""
      )}
      {user && thisUser && (user.isAdmin || user.username == "alxnko") ? (
        <>
          <Link>
            <button
              onClick={() => adminEdit("verify")}
              className="chat-prev center"
            >
              {thisUser.isVerified
                ? t("takeawayverifiedstatus")
                : t("giveverifiedstatus")}
            </button>
          </Link>
          <Link>
            <button
              onClick={() => adminEdit("tester")}
              className="chat-prev center"
            >
              {thisUser.isTester
                ? t("takeawaytesterstatus")
                : t("givetesterstatus")}
            </button>
          </Link>
          {user.username == "alxnko" ? (
            <Link>
              <button
                onClick={() => adminEdit("admin")}
                className="chat-prev center"
              >
                {thisUser.isAdmin
                  ? t("takeawayadminrights")
                  : t("giveadminrights")}
              </button>
            </Link>
          ) : (
            ""
          )}
        </>
      ) : (
        ""
      )}
    </div>
  );
}
