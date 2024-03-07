import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserBlock from "../../assets/blocks/Users/UserBlock";
import {
  MenuContext,
  TranslationContext,
} from "../../assets/contexts/contexts";

export default function Chat() {
  const { t } = useContext(TranslationContext);
  const { username } = useParams();
  const { groupid } = useParams();
  const fetchURL = username ? "/api/c/get_chat" : "/api/c/get_group";
  const [chat, setChat] = useState(undefined);
  const [messages, setMessages] = useState(undefined);
  const { setMenu } = useContext(MenuContext);
  useEffect(() => {
    setMenu(
      chat ? (
        chat.isGroup ? (
          ""
        ) : (
          <UserBlock user={chat.user} />
        )
      ) : (
        <p>{t("loading")}...</p>
      )
    );
    return () => {
      setMenu(undefined);
    };
  }, []);
  return (
    <>
      <h1>
        {chat
          ? chat.isGroup
            ? t("group") + " " + chat.name
            : t("chatwith") + " " + chat.name
          : t("loading") + "..."}
      </h1>
      <div className="messages"></div>
      {messages ? (
        messages.map((message) => {
          <div className="msg msg-my">
            <p className="time">{message.sendTime}</p>
            <p>{message.text}</p>
          </div>;
        })
      ) : (
        <p className="msg msg-info">{t("startchatting")}</p>
      )}
    </>
  );
}
