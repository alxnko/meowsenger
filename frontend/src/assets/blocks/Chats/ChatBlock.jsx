import { t } from "i18next";
import React, { forwardRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/contexts";
import { toLocalTime } from "../../scripts/time";

const ChatBlock = forwardRef(({ chatdata }, ref) => {
  const user = useContext(AuthContext);
  return (
    <div ref={ref}>
      <Link
        to={
          chatdata.isGroup ? "/group/" + chatdata.id : "/chat/" + chatdata.url
        }
      >
        <button className="chat-prev">
          <div>
            <h2>
              {chatdata.isGroup ? "g." : "u."}
              {chatdata.name}
            </h2>
            <p
              style={chatdata.isUnread ? { color: "var(--redcolor)" } : {}}
              className="time"
            >
              {chatdata.isUnread ? "• " : ""}
              {toLocalTime(chatdata.lastUpdate).toLocaleString()}
            </p>
            <p className="msg-prev">
              {user
                ? chatdata.lastMessage.author != ""
                  ? chatdata.lastMessage.author == user.username
                    ? "you: "
                    : chatdata.lastMessage.author + ": "
                  : ""
                : ""}
              {chatdata.lastMessage.text != "no messages"
                ? chatdata.lastMessage.text
                : t("nomessages")}
            </p>
          </div>
        </button>
      </Link>
    </div>
  );
});

export default ChatBlock;
