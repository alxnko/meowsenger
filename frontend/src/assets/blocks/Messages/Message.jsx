import React, { useContext } from "react";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import { decrypt } from "../../scripts/encryption";
import { genSysText } from "../../scripts/procesSystem";
import { now, toLocalTime, toTime, toTodaysTime } from "../../scripts/time";
import useLongPress from "../hooks/useLongPress";

export default function Message({ message, openContextMenu, secret }) {
  const { user } = useContext(AuthContext);
  const { t } = useContext(TranslationContext);
  let time = message ? toLocalTime(message.sendTime) : undefined;

  const onLongPress = () => {
    openContextMenu();
  };

  const onClick = () => {};
  const defaultOptions = {
    shouldPreventDefault: true,
    delay: 200,
  };

  const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

  let isMine =
    user && message && user != "unAuth"
      ? message.author.username == user.username
      : false;
  return (
    <div
      onContextMenu={(e) => {
        if (openContextMenu) {
          e.preventDefault();
          openContextMenu();
        }
        console.log("Right Click");
      }}
      className={
        "msg new-msg" +
        (message && message.isSystem ? " msg-info" : isMine ? " msg-my" : "")
      }
    >
      <div
        className="flsb"
        style={{ flexDirection: isMine ? "row" : "row-reverse" }}
      >
        <p className="time">
          {time
            ? time.toDateString() != now.toDateString()
              ? toTime(time)
              : toTodaysTime(time)
            : ""}
        </p>
        <p className="time">{message ? message.author.username : ""} </p>
      </div>
      <p className="msg-text">
        {message
          ? message.isSystem
            ? genSysText(message.text, secret, t)
            : decrypt(message.text, secret)
          : ""}
      </p>
    </div>
  );
}
