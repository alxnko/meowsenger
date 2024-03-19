import React, { createRef, useContext, useState } from "react";
import { TranslationContext } from "../../contexts/contexts";
import ChatBlock from "./ChatBlock";
import ChatFilter from "./ChatFilter";

export default function ChatList({ chats, noLinks, onClick }) {
  const { t } = useContext(TranslationContext);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  return (
    <>
      <ChatFilter filter={filter} setFilter={setFilter} />
      {chats ? (
        <input
          style={{ marginBottom: "0", marginTop: "10px" }}
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      ) : (
        ""
      )}
      <div className="chatlist">
        {chats
          ? chats.map((chat) =>
              (!filter || chat.type == filter) && chat.name.includes(search) ? (
                <ChatBlock
                  key={chat.id}
                  chatData={chat}
                  noLinks={noLinks}
                  onClick={
                    onClick ? () => onClick(chat.id, chat.secret) : () => {}
                  }
                  ref={createRef()}
                />
              ) : (
                ""
              )
            )
          : ""}
      </div>
    </>
  );
}
