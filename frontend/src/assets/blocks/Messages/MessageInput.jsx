import React, { useContext, useEffect, useState } from "react";
import { BiSolidSend } from "react-icons/bi";
import { TranslationContext } from "../../contexts/contexts";
import { decrypt } from "../../scripts/encryption";

export default function MessageInput({
  isEdit,
  setEdit,
  sendMsg,
  editMsg,
  currentMsg,
  replyTo,
  setReplyTo,
  secret,
}) {
  const { t } = useContext(TranslationContext);
  const [text, setText] = useState("");
  useEffect(() => {
    if (isEdit && currentMsg) setText(decrypt(currentMsg.text, secret));
  }, [isEdit]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (isEdit) {
      editMsg(text);
    } else {
      if (text.trim() != "") {
        sendMsg(text);
      }
    }
    setText("");
  };
  return (
    <div className="msg-form fw fwc">
      {replyTo ? (
        <div className="flex jc-sb reply">
          <p>
            {t("replyto") +
              " " +
              replyTo.author.username +
              ": " +
              decrypt(replyTo.text, secret)}
          </p>
          <button onClick={() => setReplyTo(undefined)}>X</button>
        </div>
      ) : isEdit ? (
        <div className="flex jc-sb reply">
          <p>{t("editing") + ": " + decrypt(currentMsg.text, secret)}</p>
          <button
            onClick={() => {
              setText("");
              setEdit(false);
            }}
          >
            X
          </button>
        </div>
      ) : (
        ""
      )}
      <form className="flex" onSubmit={sendMessage}>
        <textarea
          placeholder={t("message")}
          value={text}
          onKeyDown={(e) => {
            if (e.key == "Enter" && e.shiftKey == false) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          onChange={(e) => {
            setText(e.target.value);
          }}
          type="text"
        ></textarea>
        <button type="submit">
          <BiSolidSend />
        </button>
      </form>
    </div>
  );
}
