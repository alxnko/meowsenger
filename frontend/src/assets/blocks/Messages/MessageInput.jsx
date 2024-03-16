import React, { useContext, useState } from "react";
import { BiSolidSend } from "react-icons/bi";
import { TranslationContext } from "../../contexts/contexts";

export default function MessageInput({ chatName, sendMsg }) {
  const { t } = useContext(TranslationContext);
  const [text, setText] = useState("");
  const sendMessage = (e) => {
    e.preventDefault();
    if (text.trim() != "") {
      sendMsg(text);
    }
    setText("");
  };
  return (
    <form className="msg-form fw fwc" onSubmit={sendMessage}>
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
  );
}
