import React, { useContext } from "react";
import { BiSolidEditAlt, BiSolidShare } from "react-icons/bi";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import { decrypt } from "../../scripts/encryption";
import { genSysText } from "../../scripts/procesSystem";
import { now, toLocalTime, toTime, toTodaysTime } from "../../scripts/time";
import UserBadges from "../Users/UserBadges";
import useLongPress from "../hooks/useLongPress";

export default function Message({
  innerRef,
  message,
  openContextMenu,
  secret,
}) {
  const { user } = useContext(AuthContext);
  const { t, ts } = useContext(TranslationContext);
  let time = message ? toLocalTime(message.sendTime) : undefined;
  let replyTime =
    message && message.replyTo
      ? toLocalTime(message.replyTo.sendTime)
      : undefined;

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
      ref={innerRef}
      onContextMenu={(e) => {
        if (openContextMenu) {
          e.preventDefault();
          openContextMenu();
        }
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
          {message && message.isForwarded ? <BiSolidShare /> : ""}
          {message && message.isEdited ? <BiSolidEditAlt /> : ""}
        </p>
        <p className="time">
          {message ? message.author.username : ""}{" "}
          <UserBadges user={message ? message.author : {}} />
        </p>
      </div>
      {message && message.replyTo ? (
        <div className="reply">
          <div
            className="flsb"
            style={{ flexDirection: isMine ? "row" : "row-reverse" }}
          >
            <p className="time">
              {replyTime
                ? replyTime.toDateString() != now.toDateString()
                  ? toTime(replyTime)
                  : toTodaysTime(replyTime)
                : ""}
            </p>
            <p className="time">
              {message ? message.replyTo.author.username : ""}{" "}
              <UserBadges user={message ? message.replyTo.author : {}} />
            </p>
          </div>
          {decrypt(message.replyTo.text, secret)}
        </div>
      ) : (
        ""
      )}
      <p className="msg-text">
        {message
          ? message.isSystem
            ? genSysText(message.text, secret, ts)
            : decrypt(message.text, secret)
          : ""}
      </p>
    </div>
  );
}
