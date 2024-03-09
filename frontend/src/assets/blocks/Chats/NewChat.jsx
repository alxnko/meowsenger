import React, { useContext, useState } from "react";
import PopUp from "../PopUps/PopUp";
import { TranslationContext } from "../../contexts/contexts";
import { useNavigate } from "react-router-dom";

export default function NewChat({ show, setIsShow }) {
  const { t } = useContext(TranslationContext);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleUsername = (e) => {
    setUsername(e.target.value.replace(/\s/g, ""));
  };

  const newChat = (e) => {
    e.preventDefault();
    fetch("/api/u/has_user/" + username)
      .then((res) => {
        if (res.status != "200") {
          return { status: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          navigate("/chat/" + username);
        } else setError(t("nouser"));
      });
  };

  return (
    <PopUp show={show} setIsShow={setIsShow}>
      <form className="fl-cn-cl" onSubmit={newChat}>
        <h2>
          {t("newchat")} {t("with")}
        </h2>
        <input
          value={username}
          onChange={handleUsername}
          type="text"
          placeholder={t("username")}
        />
        <div className="invalid-feedback">
          <span>{error}</span>
        </div>
        <input type="submit" value={t("start")} />
      </form>
    </PopUp>
  );
}
