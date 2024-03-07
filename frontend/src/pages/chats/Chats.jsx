import React, { createRef, useContext, useEffect, useState } from "react";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import ChatBlock from "../../assets/blocks/Chats/ChatBlock";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Chats() {
  const { t } = useContext(TranslationContext);
  const user = useContext(AuthContext);
  const [isLoader, setIsLoader] = useContext(LoaderContext);
  let lastUpdate = 0;
  const [chats, setChats] = useState(undefined);
  useEffect(() => {
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
      }
      setIsLoader(false);
    }
  };
  return (
    <div>
      <IsAuth />
      <p>{t("chatlist")}</p>
      <div>
        <div className="chats">
          <div className="flex">
            <button className="chat-prev">{t("newchat")}</button>
            <button style={{ marginLeft: 10 }} className="chat-prev">
              {t("newgroup")}
            </button>
          </div>
          <div className="chatlist">
            {chats
              ? chats.map((chat) => (
                  <ChatBlock key={chat.id} chatdata={chat} ref={createRef()} />
                ))
              : setIsLoader(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
