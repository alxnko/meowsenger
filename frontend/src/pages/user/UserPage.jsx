import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import UserBadges from "../../assets/blocks/Users/UserBadges";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
export default function UserPage() {
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const { setIsLoader } = useContext(LoaderContext);
  const [thisUser, setThisUser] = useState(undefined);
  let isItMe = undefined;
  const { username } = useParams();
  const navigate = useNavigate();

  const updatePage = () => {
    setIsLoader(true);
    isItMe = user && user.username == username;
    if (isItMe) {
      setThisUser(user);
      setIsLoader(false);
    } else if (user) {
      fetchUser();
    }
  };

  useEffect(() => {
    setIsLoader(true);
    updatePage();
  }, [user, navigate]);

  const fetchUser = () => {
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
        <button className="chat-prev">{t("openchat")}</button>
      </Link>
    </div>
  );
}
