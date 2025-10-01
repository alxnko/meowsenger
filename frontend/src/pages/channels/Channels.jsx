import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import ChatList from "../../assets/blocks/Chats/ChatList";
import { useInterval } from "../../assets/blocks/hooks/useInterval";
import PopUp from "../../assets/blocks/PopUps/PopUp";
import {
  AuthContext,
  LoaderContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";

export default function Channels() {
  const navigate = useNavigate();

  const [channels, setChannels] = useState(undefined);
  const { user } = useContext(AuthContext);
  const { t } = useContext(TranslationContext);
  const { setIsLoader } = useContext(LoaderContext);

  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  useInterval(() => {
    if (!isFetching) {
      fetchChannels();
    }
  }, 1000);

  useEffect(() => {
    setIsLoader(true);
  }, []);

  const fetchChannels = async () => {
    if (user) {
      setIsFetching(true);
      await fetch("/api/ch/get_channels", createPostData({}))
        .then((res) => {
          if (res.status !== 200) {
            setIsLoader(true);
            return { status: false };
          }
          setIsLoader(false);
          return res.json();
        })
        .then((data) => {
          if (data && data.status && "data" in data) {
            setChannels(data.data);
          }
          setIsLoader(false);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  };

  const createChannel = (e) => {
    e.preventDefault();
    if (channelName.length > 2 && channelName.length < 21) {
      fetch(
        "/api/ch/create_channel",
        createPostData({
          name: channelName,
          description: channelDesc || "meowsenger channel",
          isPublic: isPublic,
        })
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setIsNewChannelOpen(false);
            setChannelName("");
            setChannelDesc("");
            navigate(`/channel/${data.id}`);
          } else {
            setError(t("error"));
          }
        });
    } else {
      setError(t("baddata"));
    }
  };

  return (
    <div>
      <IsAuth />
      <PopUp show={isNewChannelOpen} setIsShow={setIsNewChannelOpen}>
        <form onSubmit={createChannel}>
          <h2 className="center">{t("newchannel") || "New Channel"}</h2>
          <label htmlFor="channelname">
            {t("channelname") || "Channel Name"}
          </label>
          <input
            id="channelname"
            type="text"
            placeholder={t("channelname") || "Channel Name"}
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <label htmlFor="channeldesc">
            {t("description") || "Description"}
          </label>
          <textarea
            id="channeldesc"
            placeholder={t("description") || "Description"}
            value={channelDesc}
            onChange={(e) => setChannelDesc(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            {" " + (t("public") || "Public")}
          </label>
          <div className="invalid-feedback">
            <span>{error}</span>
          </div>
          <input className="center" type="submit" value="OK" />
        </form>
      </PopUp>
      <p className="center">{t("channels") || "Channels"}</p>
      <div>
        <div className="chats">
          <button
            onClick={() => setIsNewChannelOpen(true)}
            className="chat-prev center"
          >
            {t("newchannel") || "New Channel"}
          </button>
          <ChatList chats={channels} filter={undefined} />
        </div>
      </div>
    </div>
  );
}
