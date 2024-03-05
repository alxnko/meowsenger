import { t } from "i18next";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IsNotAuth from "../../assets/blocks/Auth/IsNotAuth";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleUsername = (e) => {
    setUsername(e.target.value.trim());
  };
  const logMe = async () => {
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
      .then((data) => {
        if (data.status) {
          navigate("/chats");
        } else setError("unauth");
      });
  };
  return (
    <div>
      <IsNotAuth />
      <h1>{t("login")}</h1>
      <label htmlFor="username">{t("username")}</label>
      <input
        type="username"
        id="username"
        value={username}
        onChange={handleUsername}
      />
      <label htmlFor="password">{t("password")}</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="invalid-feedback">
        <span>{error}</span>
      </div>
      <div className="flex-center">
        <button onClick={logMe}>{t("login")}</button>
      </div>
    </div>
  );
}
