import React, { useContext } from "react";
import { TranslationContext } from "../../contexts/contexts";
import { toDate, toLocalTime } from "../../scripts/time";
import Message from "./Message";

export default function MessageList({
  messages,
  topMessage,
  scrollTo,
  chat,
  openMessageMenu,
  replyMsg,
  isEdit,
}) {
  const { t } = useContext(TranslationContext);
  let lastTime = undefined;
  const toDateSting = (date) => {
    lastTime = date.toDateString();
    let out = toDate(date);
    if (out[2] != ".") {
      return t(out);
    }
    return out;
  };
  return messages && messages.length ? (
    messages.map((message, index) => {
      if (!message.isDeleted) {
        let time = message ? toLocalTime(message.sendTime) : undefined;
        return (
          <>
            {!lastTime || lastTime != time.toDateString() ? (
              <p className="date center">{toDateSting(time)}</p>
            ) : (
              ""
            )}
            <Message
              key={message.id}
              openContextMenu={() => openMessageMenu(index)}
              message={message}
              secret={chat.secret}
            />
          </>
        );
      }
    })
  ) : (
    <div className="msg msg-info">
      <h3>{t("startchatting")}</h3>
      <br />
      <p>{t("messagedeletioninfo")}</p>
    </div>
  );
}
