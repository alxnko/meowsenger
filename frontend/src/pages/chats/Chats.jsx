import React, { createRef, useContext, useEffect, useState } from "react";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import ChatBlock from "../../assets/blocks/Chats/ChatBlock";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";
import PopUp from "../../assets/blocks/PopUps/PopUp";
import NewChat from "../../assets/blocks/Chats/NewChat";

export default function Chats() {
  let lastUpdate = 0;
  const [chats, setChats] = useState(undefined);
  const { t } = useContext(TranslationContext);
  const { setIsLoader } = useContext(LoaderContext);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    setIsLoader(true);
    const interval = setInterval(async () => {
      fetchData();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    await fetch("/api/c/get_chats", createPostData({ lastUpdate: lastUpdate }))
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
        if ("data" in data) {
          setChats(data.data);
        }
        lastUpdate = parseInt(data.time);
        setIsLoader(false);
      }
    }
  };

  return (
    <div>
      <IsAuth />
      <NewChat show={isNewChatOpen} setIsShow={setIsNewChatOpen} />
      <p>{t("chatlist")}</p>
      <div>
        <div className="chats">
          <div className="flex">
            <button
              onClick={() => {
                setIsNewChatOpen(true);
              }}
              className="chat-prev"
            >
              {t("newchat")}
            </button>
            <button style={{ marginLeft: 10 }} className="chat-prev">
              {t("newgroup")}
            </button>
          </div>
          <div className="chatlist">
            {chats
              ? chats.map((chat) => (
                  <ChatBlock key={chat.id} chatdata={chat} ref={createRef()} />
                ))
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
