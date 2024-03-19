import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TranslationContext } from "../../contexts/contexts";
import { createPostData } from "../../scripts/createPostData";
import { encrypt } from "../../scripts/encryption";
import PopUp from "../PopUps/PopUp";

export default function NewGroup({ show, setIsShow }) {
  const { t } = useContext(TranslationContext);

  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleGroupName = (e) => {
    setGroupName(e.target.value);
  };

  const newChat = (e) => {
    e.preventDefault();
    if (groupName.length > 2 && groupName.length < 16) {
      fetch(
        "/api/c/create_group",
        createPostData({
          name: groupName.trim(),
        })
      )
        .then((res) => {
          if (res.status != "200") {
            return { status: false };
          }
          return res.json();
        })
        .then((data) => {
          if (data.status) {
            fetch(
              "/api/m/send",
              createPostData({
                id: data.id,
                text: encrypt("createdgroup " + groupName, data.secret),
                isSystem: true,
              })
            );
            navigate("/group/" + data.id);
          } else setError(t("unknownerror"));
        });
    } else {
      setError(t("baddata"));
    }
  };

  return (
    <PopUp show={show} setIsShow={setIsShow}>
      <form className="fl-cn-cl" onSubmit={newChat}>
        <h2 className="center">{t("newgroup")}</h2>
        <input
          value={groupName}
          onChange={handleGroupName}
          type="text"
          placeholder={t("usernamelimit")}
        />
        <div className="invalid-feedback">
          <span>{error}</span>
        </div>
        <input type="submit" value={t("start")} />
      </form>
    </PopUp>
  );
}
