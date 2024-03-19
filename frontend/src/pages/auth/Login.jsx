import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import IsNotAuth from "../../assets/blocks/Auth/IsNotAuth";
import {
  AuthContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Login() {
  const { t } = useContext(TranslationContext);
  const { fetchUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleUsername = (e) => {
    setUsername(e.target.value.replace(/\s/g, ""));
  };
  const logMe = async (e) => {
    e.preventDefault();
    if (username.length > 2 && password.length > 7) {
      fetch(
        "/api/u/login",
        createPostData({ username: username, password: password })
      )
        .then((res) => {
          if (res.status != "200") {
            return { status: false };
          }
          return res.json();
        })
        .then(async (data) => {
          if (data.status) {
            await fetchUser();
            navigate("/chats");
          } else setError(t("unauth"));
        });
    } else {
      setError(t("baddata"));
    }
  };
  return (
    <form onSubmit={logMe}>
      <IsNotAuth />
      <h1 className="center">{t("login")}</h1>
      <label htmlFor="username">{t("username")}</label>
      <input
        id="username"
        type="username"
        autoComplete="username"
        value={username}
        onChange={handleUsername}
      />
      <label htmlFor="password">{t("password")}</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="invalid-feedback">
        <span>{error}</span>
      </div>
      <div className="flex-center">
        <input type="submit" value={t("login")} />
      </div>
    </form>
  );
}
