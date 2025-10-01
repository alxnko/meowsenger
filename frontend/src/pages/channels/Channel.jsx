import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import GroupBlock from "../../assets/blocks/Chats/GroupBlock";
import MessageDeleteConfirmMenu from "../../assets/blocks/Messages/Menus/MessageDeleteConfirmMenu";
import MessageForwardMenu from "../../assets/blocks/Messages/Menus/MessageForwardMenu";
import Message from "../../assets/blocks/Messages/Message";
import MessageInput from "../../assets/blocks/Messages/MessageInput";
import MessageList from "../../assets/blocks/Messages/MessageList";
import PopUp from "../../assets/blocks/PopUps/PopUp";
import TPopUp from "../../assets/blocks/PopUps/TPopUp";
import UserBlock from "../../assets/blocks/Users/UserBlock";
import { useInterval } from "../../assets/blocks/hooks/useInterval";
import useOnScreen from "../../assets/blocks/hooks/useOnScreen";
import {
  AuthContext,
  LoaderContext,
  MenuContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { findMessageId } from "../../assets/scripts/binarySearch";
import { createPostData } from "../../assets/scripts/createPostData";
import { decrypt, encrypt } from "../../assets/scripts/encryption";
import { toLocalTime } from "../../assets/scripts/time";

export default function Channel() {
  const navigate = useNavigate();
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);

  const { channelId } = useParams();

  const [channel, setChannel] = useState(undefined);
  let channelIdRef = undefined;
  let canSendMsg = true;
  let canUpdateMsgs = true;
  const [messages, setMessages] = useState(undefined);
  const [last, setLast] = useState(undefined);

  const scrollTo = useRef(null);

  const topMessage = useRef(null);
  const isTopMessageVisible = useOnScreen(topMessage);

  const [isMsgMenuOpen, setMsgMenuOpen] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(undefined);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [isUserListOpen, setUserListOpen] = useState(false);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);

  const [channelName, setChannelName] = useState(undefined);
  const [channelDesc, setChannelDesc] = useState(undefined);

  const [replyMsg, setReplyMsg] = useState(undefined);

  const [isFirst, setIsFirst] = useState(2);

  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");

  const [scroll, setScroll] = useState(document.body.scrollHeight);

  const [isForwardMenuOpen, setForwardMenuOpen] = useState("");

  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const forward = (id, secret) => {
    sendMessage(decrypt(currentMsg.text, channel.secret), id, secret, true);
    setForwardMenuOpen(false);
  };

  const addAdmin = (un) => {
    fetch(
      "/api/ch/add_admin",
      createPostData({
        from: channel.id,
        username: un,
      })
    ).then(() => {
      fetchChannel();
    });
  };

  const removeAdmin = (un) => {
    fetch(
      "/api/ch/remove_admin",
      createPostData({
        from: channel.id,
        username: un,
      })
    ).then(() => {
      fetchChannel();
    });
  };

  const leaveChannel = () => {
    fetch(
      "/api/ch/leave",
      createPostData({
        from: channel.id,
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          navigate("/channels");
        }
      });
  };

  const changeChannelData = (e) => {
    e.preventDefault();
    let dict = {};
    if (
      channelName &&
      channelName.length > 2 &&
      channelName.length < 21 &&
      channelName !== channel.name
    ) {
      dict.name = channelName;
    }
    if (channelDesc && channelDesc !== channel.desc) {
      dict.description = channelDesc;
    }
    if (Object.keys(dict).length > 0) {
      dict.id = channel.id;
      fetch("/api/ch/save_settings", createPostData(dict))
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setAdminPanelOpen(false);
            fetchChannel();
          }
        });
    }
  };

  const { setMenu } = useContext(MenuContext);
  const { setIsLoader } = useContext(LoaderContext);

  useEffect(() => {
    if (!isTopMessageVisible || isFirst) {
      scrollToEnd();
      setIsFirst((prev) => prev - 1);
    } else {
      scrollToTop();
      setIsLoader(false);
    }
  }, [messages]);

  useEffect(() => {
    if (channel && user) {
      setIsAdmin(channel.admins.includes(user.username));
      setIsOwner(user.username === channel.admins[0]);
    }
  }, [user, channel]);

  function getBodyScrollTop() {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollTop;
  }

  function setBodyScrollTop(val) {
    const el = document.scrollingElement || document.documentElement;
    el.scrollTop = val;
  }

  useInterval(
    () => {
      fetchChannel();
    },
    channel ? 600000 : 500
  );

  useInterval(() => {
    fetchData();
  }, 500);

  useEffect(() => {
    setIsLoader(true);
    fetchChannel();
    return () => {
      setMenu(undefined);
    };
  }, []);

  useEffect(() => {
    if (channel) {
      channelIdRef = channel.id;
      setChannelName(channel.name);
      setChannelDesc(channel.desc);
    }
  }, [channel]);

  const scrollToEnd = () => {
    if (scrollTo.current) {
      scrollTo.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const scrollToTop = () => {
    setBodyScrollTop(scroll);
  };

  const fetchChannel = async () => {
    await fetch(
      "/api/ch/get",
      createPostData({ from: parseInt(channelId) })
    )
      .then((res) => {
        if (res.status !== 200) {
          navigate("/channels");
          return;
        }
        return res.json();
      })
      .then((data) => {
        setChannelData(data);
      });
  };

  const fetchData = async () => {
    if (channel && canUpdateMsgs) {
      canUpdateMsgs = false;
      await fetch(
        "/api/m/get_new",
        createPostData({
          id: channel.id,
          last: last,
          msgs: messages ? messages.length : 0,
          loadOld: isTopMessageVisible,
        })
      )
        .then((res) => {
          if (res.status !== 200) {
            return { status: false };
          }
          return res.json();
        })
        .then((data) => {
          setNewData(data);
          canUpdateMsgs = true;
        });
    }
  };

  const setChannelData = (data) => {
    if (data && data.status) {
      if ("channel" in data) {
        setChannel(data.channel);
        if (data.channel) {
          setMenu(
            <>
              <hr />
              <div className="chat-prev">
                <p className="center">{data.channel.name}</p>
                <p className="center">
                  {t("channel") || "Channel"} · {data.channel.memberCount}{" "}
                  {t("subscribers") || "subscribers"}
                </p>
                {data.channel.admins.includes(user?.username) ? (
                  <>
                    <button
                      onClick={() => setUserListOpen(true)}
                      className="center"
                    >
                      {t("subscribers") || "Subscribers"}
                    </button>
                    <button
                      onClick={() => setAdminPanelOpen(true)}
                      className="center"
                    >
                      {t("settings") || "Settings"}
                    </button>
                  </>
                ) : (
                  <button onClick={leaveChannel} className="center">
                    {t("leave") || "Leave Channel"}
                  </button>
                )}
              </div>
              <hr />
            </>
          );
        }
      }
      if ("messages" in data) {
        setMessages(data.messages);
        setLast(data.last);
      }
      setIsLoader(false);
    }
  };

  const setNewData = (data) => {
    if (data && data.status) {
      if ("messages" in data && data.messages) {
        let newMessages = messages ? [...messages] : [];
        data.messages.forEach((msg) => {
          const index = findMessageId(newMessages, msg.id);
          if (index === -1) {
            newMessages.push(msg);
          }
        });
        setMessages(newMessages);
      }
      if ("updates" in data && data.updates) {
        let newMessages = messages ? [...messages] : [];
        data.updates.forEach((msg) => {
          const index = findMessageId(newMessages, msg.id);
          if (index !== -1) {
            newMessages[index] = msg;
          }
        });
        setMessages(newMessages);
      }
      if ("old" in data && data.old) {
        setScroll(getBodyScrollTop());
        let newMessages = messages ? [...messages] : [];
        data.old.forEach((msg) => {
          const index = findMessageId(newMessages, msg.id);
          if (index === -1) {
            newMessages.unshift(msg);
          }
        });
        setMessages(newMessages);
      }
      if ("last" in data) {
        setLast(data.last);
      }
    }
  };

  const sendMessage = (
    text,
    id = channel.id,
    secret = channel.secret,
    isForwarded = false
  ) => {
    if (canSendMsg) {
      canSendMsg = false;
      let dict = {
        id: id,
        text: encrypt(text, secret),
      };
      if (isForwarded || id !== channel.id) {
        dict.isForwarded = true;
      }
      if (replyMsg) {
        dict.replyTo = replyMsg.id;
      }

      // Use channel-specific post endpoint
      const endpoint =
        id === channel.id ? "/api/ch/post" : "/api/m/send";

      fetch(endpoint, createPostData(dict))
        .then((res) => {
          if (res.status !== 200) {
            return { status: false };
          }
          return res.json();
        })
        .then((data) => {
          if (data.status) {
            setReplyMsg(undefined);
          } else if (data.reason === "not admin") {
            alert(t("onlyadminscanpost") || "Only admins can post to channels");
          }
          canSendMsg = true;
        });
    }
  };

  const deleteMessage = (id) => {
    fetch("/api/m/delete", createPostData({ id: id }))
      .then((res) => {
        if (res.status !== 200) {
          return { status: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          setMsgMenuOpen(false);
          setDeleteConfirmOpen(false);
        }
      });
  };

  return (
    <div>
      <IsAuth />
      {channel ? (
        <>
          <MessageDeleteConfirmMenu
            show={isDeleteConfirmOpen}
            setIsShow={setDeleteConfirmOpen}
            onDelete={() => deleteMessage(currentMsg.id)}
          />
          <MessageForwardMenu
            show={isForwardMenuOpen}
            setIsShow={setForwardMenuOpen}
            onForward={forward}
          />
          <TPopUp show={isMsgMenuOpen} setIsShow={setMsgMenuOpen}>
            {currentMsg && currentMsg.author.username === user?.username ? (
              <button
                className="chat-prev center"
                onClick={() => {
                  setMsgMenuOpen(false);
                  setDeleteConfirmOpen(true);
                }}
              >
                {t("delete")}
              </button>
            ) : (
              ""
            )}
            <button
              className="chat-prev center"
              onClick={() => {
                setMsgMenuOpen(false);
                setReplyMsg(currentMsg);
              }}
            >
              {t("reply")}
            </button>
            <button
              className="chat-prev center"
              onClick={() => {
                setMsgMenuOpen(false);
                setForwardMenuOpen(true);
              }}
            >
              {t("forward")}
            </button>
          </TPopUp>

          <PopUp show={isUserListOpen} setIsShow={setUserListOpen}>
            {channel.users.map((user) => (
              <UserBlock
                key={user.username}
                user={user}
                isGroup={true}
                isAdmin={isAdmin}
                isOwner={isOwner}
                isUserAdmin={channel.admins.includes(user.username)}
                addAdmin={() => addAdmin(user.username)}
                removeAdmin={() => removeAdmin(user.username)}
                remove={() => {}}
              />
            ))}
          </PopUp>

          {isAdmin ? (
            <>
              <PopUp show={isAdminPanelOpen} setIsShow={setAdminPanelOpen}>
                <form onSubmit={changeChannelData}>
                  <h2 className="center">{t("settings")}</h2>
                  <label htmlFor="name">{t("channelname")}</label>
                  <input
                    id="name"
                    type="text"
                    placeholder={t("channelname")}
                    value={channelName || ""}
                    onChange={(e) => setChannelName(e.target.value)}
                  />
                  <label htmlFor="description">{t("description")}</label>
                  <textarea
                    id="description"
                    placeholder={t("description")}
                    value={channelDesc || ""}
                    onChange={(e) => setChannelDesc(e.target.value)}
                  />
                  <input className="center" type="submit" value="OK" />
                </form>
              </PopUp>
            </>
          ) : (
            ""
          )}
        </>
      ) : (
        ""
      )}
      <div id="cnt" style={{ marginBottom: "85px" }}>
        {messages
          ? messages.map((msg, i) => {
              return i === 0 ? (
                <div key={msg.id} ref={topMessage}>
                  <Message
                    msg={msg}
                    secret={channel?.secret}
                    setCurrentMsg={(msg) => {
                      setMsgMenuOpen(true);
                      setCurrentMsg(msg);
                    }}
                  />
                </div>
              ) : (
                <Message
                  key={msg.id}
                  msg={msg}
                  secret={channel?.secret}
                  setCurrentMsg={(msg) => {
                    setMsgMenuOpen(true);
                    setCurrentMsg(msg);
                  }}
                />
              );
            })
          : ""}
        <div ref={scrollTo}></div>
      </div>
      {channel && isAdmin ? (
        <MessageInput
          sendMessage={sendMessage}
          replyMsg={replyMsg}
          setReplyMsg={setReplyMsg}
          secret={channel.secret}
        />
      ) : channel && !isAdmin ? (
        <div
          style={{
            position: "fixed",
            bottom: "0",
            width: "100%",
            textAlign: "center",
            padding: "20px",
            backgroundColor: "var(--bg)",
          }}
        >
          <p>{t("onlyadminscanpost") || "Only admins can post to this channel"}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
