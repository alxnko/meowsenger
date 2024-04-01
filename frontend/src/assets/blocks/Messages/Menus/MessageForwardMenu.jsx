import React, { useContext, useEffect, useState } from "react";
import { LoaderContext } from "../../../contexts/contexts";
import { createPostData } from "../../../scripts/createPostData";
import ChatList from "../../Chats/ChatList";
import PopUp from "../../PopUps/PopUp";

export default function MessageForwardMenu({ show, setIsShow, forward }) {
  const [chats, setChats] = useState(undefined);
  const { setIsLoader } = useContext(LoaderContext);

  useEffect(() => {
    if (show) {
      fetchChats();
    }
  }, [show]);

  const fetchChats = async () => {
    await fetch("/api/c/get_chats", createPostData({ lastUpdate: 0, chats: 0 }))
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
        setIsLoader(false);
      }
    }
  };

  return (
    <PopUp show={show} setIsShow={setIsShow}>
      <ChatList chats={chats} noLinks={true} onClick={forward} />
    </PopUp>
  );
}
