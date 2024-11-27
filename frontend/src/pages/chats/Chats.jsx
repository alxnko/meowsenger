import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import ChatList from "../../assets/blocks/Chats/ChatList";
import NewChat from "../../assets/blocks/Chats/NewChat";
import NewGroup from "../../assets/blocks/Chats/NewGroup";
import { useInterval } from "../../assets/blocks/hooks/useInterval";
import PopUp from "../../assets/blocks/PopUps/PopUp";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Chats() {
  let lastUpdate = 0;
  let chatsLen = 0;

  const navigate = useNavigate();

  const { type } = useParams();

  const [filter, setFilter] = useState(type);
  const [isMain, setIsMain] = useState(true);

  const [chats, setChats] = useState(undefined);
  const { user } = useContext(AuthContext);
  const { t } = useContext(TranslationContext);
  const { setIsLoader } = useContext(LoaderContext);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Add a new state to track fetching
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const path = window.location.pathname.split("/");
    const isMain = path[path.length - 1] === "chats";
    setFilter(isMain ? undefined : path[path.length - 1]);
    setIsMain(isMain);
  }, [navigate]);

  useInterval(() => {
    // Only fetch if not currently fetching
    if (!isFetching) {
      fetchData();
    }
  }, 500);

  useEffect(() => {
    setIsLoader(true);
  }, []);

  const fetchData = async () => {
    if (user) {
      setIsFetching(true); // Start fetching
      await fetch(
        "/api/c/get_chats",
        createPostData({ lastUpdate: lastUpdate, chats: chatsLen })
      )
        .then((res) => {
          if (res.status !== 200) {
            setIsLoader(true);
            return [];
          }
          setIsLoader(false);
          return res.json();
        })
        .then((data) => {
          setData(data);
        })
        .finally(() => {
          setIsFetching(false); // Finish fetching
        });
    }
  };

  const setData = (data) => {
    if (data && data.status) {
      if ("data" in data) {
        setChats(data.data);
        chatsLen = data.data.length;
      }
      lastUpdate = parseInt(data.time, 10);
      setIsLoader(false);
    }
  };

  return (
    <div>
      <IsAuth />
      <NewGroup show={isNewGroupOpen} setIsShow={setIsNewGroupOpen} />
      <NewChat show={isNewChatOpen} setIsShow={setIsNewChatOpen} />
      <PopUp show={isCreateMenuOpen} setIsShow={setIsCreateMenuOpen}>
        <button
          onClick={() => {
            setIsCreateMenuOpen(false);
            setIsNewChatOpen(true);
          }}
          className="chat-prev center"
        >
          {t("newchat")}
        </button>
        <button
          onClick={() => {
            setIsCreateMenuOpen(false);
            setIsNewGroupOpen(true);
          }}
          className="chat-prev center"
        >
          {t("newgroup")}
        </button>
      </PopUp>
      <p className="center">{t("chatlist")}</p>
      <div>
        <div className="chats">
          <button
            onClick={() => setIsCreateMenuOpen(true)}
            className="chat-prev center"
          >
            {t("createnew")}
          </button>
          <ChatList chats={chats} filter={filter} />
        </div>
      </div>
    </div>
  );
}
