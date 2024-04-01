import React, { useContext } from "react";
import { TranslationContext } from "../../../contexts/contexts";
import PopUp from "../../PopUps/PopUp";

export default function MessageDeleteConfirmMenu({
  show,
  setIsShow,
  deleteMessage,
}) {
  const { t } = useContext(TranslationContext);
  return (
    <PopUp show={show} setIsShow={setIsShow}>
      <h2 className="center">{t("areyousure")}</h2>
      <div style={{ maxWidth: "350px" }} className="flex">
        <button
          onClick={() => setDeleteConfirmOpen(false)}
          className="chat-prev center"
          style={{ marginRight: "5px", width: "200px" }}
        >
          {t("no")}
        </button>
        <button
          onClick={deleteMessage}
          className="chat-prev center"
          style={{ marginLeft: "5px", width: "200px" }}
        >
          {t("yes")}
        </button>
      </div>
    </PopUp>
  );
}
