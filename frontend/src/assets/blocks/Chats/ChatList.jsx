import React, { createRef } from "react";
import ChatBlock from "./ChatBlock";

export default function ChatList({ chats, filter }) {
  return (
    <div className="chatlist">
      {chats
        ? chats.map((chat) =>
            !filter || chat.type == filter ? (
              <ChatBlock key={chat.id} chatdata={chat} ref={createRef()} />
            ) : (
              ""
            )
          )
        : ""}
    </div>
  );
}
