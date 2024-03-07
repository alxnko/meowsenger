import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import IsNotAuth from "../../assets/blocks/Auth/IsNotAuth";
import { TranslationContext } from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Signup() {
  const navigate = useNavigate();
  const { t } = useContext(TranslationContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const handleUsername = (e) => {
    setUsername(e.target.value.trim());
  };
  const regMe = (e) => {
    e.preventDefault();
    if (username.length > 2 && password == password2 && password.length > 7) {
      fetch(
        "/api/u/register",
        createPostData({ username: username, password: password })
      )
        .then((res) => {
          if (res.status == "422") {
            setError(t("takenusername"));
            return false;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            if (data.status) {
              navigate("/chats");
            } else setError(t("unauth"));
          }
        });
    } else {
      setError(t("baddata"));
    }
  };
  return (
    <form onClick={regMe}>
      <IsNotAuth />
      <h1>{t("signup")}</h1>
      <label htmlFor="username">{t("username")}</label>
      <input
        id="username"
        type="username"
        value={username}
        onChange={handleUsername}
      />
      <label htmlFor="password">{t("password")}</label>
      <input
        id="password"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <label htmlFor="password2">
        {t("confirm")} {t("password")}
      </label>
      <input
        id="password2"
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
      <div className="invalid-feedback">
        <span>{error}</span>
      </div>
      <div className="flex-center">
        <input type="submit" value={t("signup")} />
      </div>
    </form>
  );
}
