import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserBlock from "../../assets/blocks/Users/UserBlock";
import {
  LoaderContext,
  MenuContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Chat() {
  const { t } = useContext(TranslationContext);
  const { username } = useParams();
  const { groupid } = useParams();
  const { setIsLoader } = useContext(LoaderContext);
  const fetchURL = username ? "/api/c/get_chat/" : "/api/c/get_group/";
  const [chat, setChat] = useState(undefined);
  const [messages, setMessages] = useState(undefined);
  const { setMenu } = useContext(MenuContext);
  useEffect(() => {
    fetchChat();
    const interval = setInterval(async () => {
      // fetchData();
    }, 500);
    setMenu(
      chat ? (
        chat.isGroup ? (
          ""
        ) : (
          <UserBlock user={chat.users[0]} />
        )
      ) : (
        <p>{t("loading")}...</p>
      )
    );
    return () => {
      setMenu(undefined);
      clearInterval(interval);
    };
  }, []);
  const fetchChat = async () => {
    await fetch(fetchURL, createPostData({ from: username }))
      .then((res) => {
        if (res.status != "200") {
          setIsLoader(true);
          return [];
        }
        setIsLoader(false);
        return res.json();
      })
      .then((data) => {
        setData(data);
      });
  };
  const setData = (data) => {
    if (data) {
      if (data.status) {
        if ("chat" in data) {
          setChat(data.chat);
        }
        setIsLoader(false);
      }
    }
  };
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
