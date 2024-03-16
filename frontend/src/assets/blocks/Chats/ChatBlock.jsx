import React, { forwardRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import { decrypt } from "../../scripts/encryption";
import { genSysText } from "../../scripts/procesSystem";
import { now, toLocalTime, toTime, toTodaysTime } from "../../scripts/time";
import { AdminBadge, VerifiedBadge } from "../Users/UserBadges";

const ChatBlock = forwardRef(({ chatdata }, ref) => {
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const time = toLocalTime(chatdata.lastUpdate);
  return (
    <div ref={ref}>
      <Link
        to={
          chatdata.isGroup ? "/group/" + chatdata.id : "/chat/" + chatdata.url
        }
      >
        <button className="chat-prev">
          <div>
            <h2 style={{ fontSize: "24px" }}>
              {chatdata.isGroup ? "g." : "u."}
              {chatdata.name}
              {chatdata.isVerified ? <VerifiedBadge /> : ""}
              {chatdata.isAdmin ? <AdminBadge /> : ""}
            </h2>
            <p
              style={chatdata.isUnread ? { color: "var(--redcolor)" } : {}}
              className="time"
            >
              {chatdata.isUnread ? "• " : ""}
              {time.toDateString() != now.toDateString()
                ? toTime(time)
                : toTodaysTime(time)}
            </p>
            <p className="msg-prev">
              {user
                ? chatdata.lastMessage.author != ""
                  ? chatdata.lastMessage.author == user.username
                    ? t("you") + ": "
                    : chatdata.isGroup
                    ? chatdata.lastMessage.author + ": "
                    : ""
                  : ""
                : ""}
              {chatdata.lastMessage.text != "no messages"
                ? chatdata.lastMessage.isSystem
                  ? genSysText(chatdata.lastMessage.text, chatdata.secret, t)
                  : decrypt(chatdata.lastMessage.text, chatdata.secret)
                : t("nomessages")}
            </p>
          </div>
        </button>
      </Link>
    </div>
  );
});

export default ChatBlock;
