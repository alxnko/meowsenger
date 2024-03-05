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
            <p className="msg">
              {chatdata.lastMessage.author != ""
                ? chatdata.lastMessage.author == user.username
                  ? "you: "
                  : chatdata.lastMessage.author + ": "
                : ""}
              {chatdata.lastMessage.text}
            </p>
          </div>
          <p
            style={chatdata.isUnread ? { color: "var(--redcolor)" } : {}}
            className="time"
          >
            {toLocalTime(chatdata.lastUpdate).toLocaleString()}
          </p>
        </button>
      </Link>
    </div>
  );
});

export default ChatBlock;
