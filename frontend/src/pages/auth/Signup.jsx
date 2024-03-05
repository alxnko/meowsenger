import { t } from "i18next";
import React, { useState } from "react";
import IsNotAuth from "../../assets/blocks/Auth/IsNotAuth";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const handleUsername = (e) => {
    setUsername(e.target.value.trim());
  };
  return (
    <div>
      <IsNotAuth />
      <h1>{t("signup")}</h1>
      <label htmlFor="username">{t("username")}</label>
      <div className="invalid-feedback">
        <span></span>
      </div>
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
      <div className="flex-center">
        <button>{t("signup")}</button>
      </div>
    </div>
  );
}
