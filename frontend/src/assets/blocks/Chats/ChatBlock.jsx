import React, { forwardRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import { decrypt } from "../../scripts/encryption";
import { genSysText } from "../../scripts/procesSystem";
import { now, toLocalTime, toTime, toTodaysTime } from "../../scripts/time";
import UserBadges from "../Users/UserBadges";

const ChatBlock = forwardRef(({ chatData, noLinks, onClick }, ref) => {
  const { t, ts } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const time = toLocalTime(chatData.lastUpdate);
  return (
    <div ref={ref}>
      <Link
        to={
          noLinks
            ? ""
            : chatData.isGroup
            ? "/group/" + chatData.id
            : "/chat/" + chatData.url
        }
      >
        <button onClick={onClick ? onClick : () => {}} className="chat-prev">
          <div>
            <h2 style={{ fontSize: "24px" }}>
              {chatData.isGroup ? "g." : "u."}
              {chatData.name}
              <UserBadges user={chatData} />
            </h2>
            <p
              style={chatData.isUnread ? { color: "var(--redcolor)" } : {}}
              className="time"
            >
              {chatData.isUnread ? "• " : ""}
              {time.toDateString() != now.toDateString()
                ? toTime(time)
                : toTodaysTime(time)}
            </p>
            <p className="msg-prev">
              {user
                ? chatData.lastMessage.author != ""
                  ? chatData.lastMessage.author == user.username
                    ? t("you") + ": "
                    : chatData.isGroup
                    ? chatData.lastMessage.author + ": "
                    : ""
                  : ""
                : ""}
              {chatData.lastMessage.text != "no messages"
                ? chatData.lastMessage.isSystem
                  ? genSysText(chatData.lastMessage.text, chatData.secret, ts)
                  : decrypt(chatData.lastMessage.text, chatData.secret)
                : t("nomessages")}
            </p>
          </div>
        </button>
      </Link>
    </div>
  );
});

export default ChatBlock;
