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
import UserBadges from "../../assets/blocks/Users/UserBadges";
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

export default function Chat() {
  const navigate = useNavigate();
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);

  const { username } = useParams();
  const { groupId } = useParams();
  const fetchURL = username ? "/api/c/get_chat" : "/api/c/get_group";

  const [chat, setChat] = useState(undefined);
  let chatId = undefined;
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

  const [groupName, setGroupName] = useState(undefined);
  const [groupDesc, setGroupDesc] = useState(undefined);

  const [replyMsg, setReplyMsg] = useState(undefined);

  const [isFirst, setIsFirst] = useState(true);

  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");

  const [isDeleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [password, setPassword] = useState("");

  const [scroll, setScroll] = useState(document.body.scrollHeight);

  const [isForwardMenuOpen, setForwardMenuOpen] = useState("");

  const [isEdit, setEdit] = useState(false);

  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const forward = (id, secret) => {
    sendMessage(decrypt(currentMsg.text, chat.secret), id, secret, true);
    setForwardMenuOpen(false);
  };

  const editMessage = (text) => {
    fetch(
      "/api/m/edit",
      createPostData({ id: currentMsg.id, text: encrypt(text, chat.secret) })
    );
    setEdit(false);
  };

  const deleteMessage = () => {
    fetch("/api/m/delete", createPostData({ id: currentMsg.id }));
    setDeleteConfirmOpen(false);
  };

  const handleNewUsername = (e) => {
    setNewUsername(e.target.value.replace(/\s/g, ""));
  };

  const addUser = (e) => {
    e.preventDefault();
    fetch(
      "/api/c/add_member",
      createPostData({
        from: chat.id,
        username: newUsername,
        message: encrypt("added " + newUsername, chat.secret),
      })
    );
    setAddUserOpen(false);
  };

  const removeUser = (un) => {
    fetch(
      "/api/c/remove_member",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("removed " + un, chat.secret),
      })
    );
  };

  const addAdmin = (un) => {
    fetch(
      "/api/c/add_admin",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("gaveadminrightsto " + un, chat.secret),
      })
    );
  };

  const removeAdmin = (un) => {
    fetch(
      "/api/c/remove_admin",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("tookawayadminrightsfrom " + un, chat.secret),
      })
    );
  };

  const removeGroup = (e) => {
    e.preventDefault();
    fetch(
      "/api/c/remove_group",
      createPostData({
        from: chat.id,
        password: password,
      })
    )
      .then((res) => {
        if (res.status != "200") {
          return { status: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          navigate("/chats");
        } else {
          setDeleteGroupOpen(false);
        }
      });
  };

  const changeGroupData = (e) => {
    e.preventDefault();
    let dict = {};
    if (
      groupName.length > 2 &&
      groupName.length < 16 &&
      groupName != chat.name
    ) {
      dict.name = groupName;
    }
    if (groupDesc != chat.desc) {
      dict.desc = groupDesc;
    }
    if (dict != {}) {
      dict.id = chat.id;
      dict.message = encrypt("changedgroupdata  ", chat.secret);
      fetch("/api/c/save_settings", createPostData(dict))
        .then((res) => {
          if (res.status != "200") {
            return { status: false };
          }
          return res.json();
        })
        .then(async (data) => {
          if (data.status) {
            setAdminPanelOpen(false);
          }
        });
    }
  };

  const { setMenu } = useContext(MenuContext);
  const { setIsLoader } = useContext(LoaderContext);

  useEffect(() => {
    if (!isTopMessageVisible || isFirst) {
      scrollToEnd();
      setIsFirst(false);
    } else {
      scrollToTop();
      setIsLoader(false);
    }
  }, [messages]);

  useEffect(() => {
    if (chat && user) {
      setIsAdmin(chat.admins.includes(user.username));
      setIsOwner(user.username == chat.admins[0]);
    }
  }, [user, chat]);

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
      fetchChat();
    },
    chat ? 600000 : 500
  );

  useInterval(() => {
    fetchData();
  }, 500);

  useEffect(() => {
    setIsLoader(true);
    fetchChat();
    return () => {
      setMenu(undefined);
    };
  }, []);

  const fetchChat = async () => {
    await fetch(
      fetchURL,
      createPostData(username ? { from: username } : { from: groupId })
    )
      .then((res) => {
        if (res.status != "200") {
          setIsLoader(true);
          return false;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setChatData(data);
      });
  };

  const setChatData = (data) => {
    if (data) {
      if (data.status) {
        if ("chat" in data) {
          setChat(data.chat);
          if (data.chat.isGroup) {
            setGroupName(data.chat.name);
            setGroupDesc(data.chat.desc);
          }
          chatId = data.chat.id;
          if (!data.chat.isGroup) {
            setMenu(
              <>
                <hr />
                <UserBlock user={data.chat.users[0]} isChat={true} />
                <hr />
              </>
            );
          } else {
            setMenu(
              <>
                <hr />
                <GroupBlock
                  group={data.chat}
                  openUserList={setUserListOpen}
                  openAdminPanel={setAdminPanelOpen}
                />
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
      } else {
        navigate("/chats");
      }
    }
  };

  const sendMessage = (
    text,
    id = chat.id,
    secret = chat.secret,
    isForwarded = false
  ) => {
    if (canSendMsg) {
      canSendMsg = false;
      let dict = {
        id: id,
        text: encrypt(text, secret),
      };
      if (isForwarded || id != chat.id) {
        dict.isForwarded = true;
      } else if (replyMsg) {
        dict.replyTo = replyMsg.id;
      }
      fetch("/api/m/send", createPostData(dict)).then(() => {
        canSendMsg = true;
      });
      if (replyMsg) setReplyMsg(undefined);
      return true;
    } else return false;
  };

  const fetchData = () => {
    if (chat && canUpdateMsgs) {
      canUpdateMsgs = false;
      fetch(
        "/api/m/get_new",
        createPostData({
          id: chat.id,
          last: last,
          loadOld: !isFirst ? isTopMessageVisible : false,
          msgs: messages.length,
        })
      )
        .then((res) => {
          if (res.status != "200") {
            setIsLoader(true);
            return [];
          }
          setIsLoader(false);
          return res.json();
        })
        .then((data) => {
          setMessagesData(data);
          canUpdateMsgs = true;
        });
    } else {
      return [];
    }
  };

  const setMessagesData = (data) => {
    if (data) {
      if (data.status) {
        if ("messages" in data) {
          if (data.messages) {
            if (
              data.messages.filter((msg) => {
                msg.isSystem;
              }).length
            ) {
              fetchChat();
            }
            setMessages((messages) => {
              return [...messages, ...data.messages];
            });
          }
          if (data.old) {
            setIsLoader(true);
            let val = document.body.scrollHeight - getBodyScrollTop();
            setScroll(val);
            setMessages((messages) => {
              return [...data.old, ...messages];
            });
          }
          if (data.updates) {
            setMessages((messages) => {
              var indexes = [];
              var found;
              data.updates.forEach((message) => {
                let localMessageId = findMessageId(messages, message.id);
                if (localMessageId != -1) {
                  indexes.push([message, localMessageId]);
                  found = true;
                }
              });
              if (found) {
                let msgs = messages;
                indexes.forEach(([message, index]) => {
                  if (message.isDeleted) {
                    msgs.splice(index, 1);
                  } else {
                    msgs[index] = message;
                  }
                });
                return msgs;
              }
              return messages;
            });
          }
          setLast(data.last);
        }
        setIsLoader(false);
      } else if ("reason" in data) {
        if (data.reason == "not in chat") {
          navigate("/chats");
        }
      }
    }
  };

  const scrollToEnd = () => {
    scrollTo.current.scrollIntoView();
  };

  const scrollToTop = () => {
    setBodyScrollTop(document.body.scrollHeight - scroll);
  };

  const openMsgContextMenu = (id) => {
    setCurrentMsg(messages[id]);
    setMsgMenuOpen(true);
  };

  return (
    <>
      <IsAuth />
      <MessageDeleteConfirmMenu
        show={isDeleteConfirmOpen}
        setIsShow={setDeleteConfirmOpen}
        deleteMessage={deleteMessage}
      />
      <MessageForwardMenu
        show={isForwardMenuOpen}
        setIsShow={setForwardMenuOpen}
        forward={forward}
      />
      <TPopUp show={isMsgMenuOpen} setIsShow={setMsgMenuOpen}>
        <div>
          <Message message={currentMsg} secret={chat ? chat.secret : ""} />
          <br />
          <div style={{ maxWidth: "450px" }} className="popup">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  decrypt(currentMsg.text, chat.secret)
                );
                setMsgMenuOpen(false);
              }}
            >
              {t("copy")}
            </button>
            {currentMsg && !currentMsg.isSystem ? (
              <>
                <button
                  onClick={() => {
                    if (isEdit) setEdit(undefined);
                    setReplyMsg(currentMsg);
                    setMsgMenuOpen(false);
                  }}
                >
                  {t("reply")}
                </button>
                <button
                  onClick={() => {
                    setForwardMenuOpen(true);
                    setMsgMenuOpen(false);
                  }}
                >
                  {t("forward")}
                </button>
                {currentMsg.author.username == user.username ? (
                  <>
                    {toLocalTime(currentMsg.sendTime) >=
                    Date.now() - 1800000 ? (
                      <button
                        onClick={() => {
                          if (replyMsg) setReplyMsg(undefined);
                          setEdit(true);
                          setMsgMenuOpen(false);
                        }}
                      >
                        {t("edit")}
                      </button>
                    ) : (
                      ""
                    )}
                    <button
                      onClick={() => {
                        setDeleteConfirmOpen(true);
                        setMsgMenuOpen(false);
                      }}
                    >
                      {t("delete")}
                    </button>
                  </>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </TPopUp>
      {chat && chat.isGroup ? (
        <>
          <PopUp show={isUserListOpen} setIsShow={setUserListOpen}>
            {chat
              ? chat.users.map((user) => (
                  <UserBlock
                    key={user.username}
                    user={user}
                    isGroup={true}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                    isUserAdmin={chat.admins.includes(user.username)}
                    addAdmin={() => addAdmin(user.username)}
                    removeAdmin={() => removeAdmin(user.username)}
                    remove={() => removeUser(user.username)}
                  />
                ))
              : ""}
            {isAdmin ? (
              <button
                onClick={() => {
                  setAddUserOpen(true);
                }}
                className="chat-prev center"
              >
                {t("addmember")}
              </button>
            ) : (
              ""
            )}
          </PopUp>
          {isAdmin ? (
            <>
              <PopUp show={isAdminPanelOpen} setIsShow={setAdminPanelOpen}>
                <form onSubmit={changeGroupData}>
                  <h2 className="center">{t("settings")}</h2>
                  <h3>{t("groupname")}</h3>
                  <input
                    className="search"
                    placeholder={t("usernamelimit")}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    type="text"
                  />

                  <h3>{t("description")}</h3>
                  <input
                    className="search"
                    onChange={(e) => setGroupDesc(e.target.value)}
                    value={groupDesc}
                    type="text"
                  />
                  <div className="flex-center">
                    <input type="submit" value={t("save")} />
                  </div>
                </form>
                <button
                  onClick={() => {
                    setDeleteGroupOpen(true);
                  }}
                  className="chat-prev center"
                >
                  {t("deletegroup")}
                </button>
              </PopUp>
              <PopUp show={isAddUserOpen} setIsShow={setAddUserOpen}>
                <form className="fl-cn-cl" onSubmit={addUser}>
                  <h2>{t("addmember")}</h2>
                  <input
                    value={newUsername}
                    onChange={handleNewUsername}
                    type="text"
                    placeholder={t("username")}
                  />
                  <div className="invalid-feedback">
                    <span>{error}</span>
                  </div>
                  <input className="center" type="submit" value="OK" />
                </form>
              </PopUp>
              <PopUp show={isDeleteGroupOpen} setIsShow={setDeleteGroupOpen}>
                <form className="fl-cn-cl" onSubmit={removeGroup}>
                  <p style={{ maxWidth: "350px" }} className="center">
                    {t("securitypassword")}
                  </p>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                  />
                  <input value="OK" className="center" type="submit" />
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
      <div
        id="cnt"
        style={{ scrollPaddingBottom: replyMsg || isEdit ? "120px" : "80px" }}
      >
        <div className="flex-center chat-title">
          <h2 style={{ fontSize: "20px" }}>
            {chat
              ? chat.isGroup
                ? " g." + chat.name
                : "u." + chat.name
              : t("loading") + "..."}
            <UserBadges user={chat} />
          </h2>
        </div>
        <div
          style={{ marginBottom: replyMsg || isEdit ? "120px" : "80px" }}
          className="messages"
        >
          <div ref={topMessage}></div>
          <MessageList
            messages={messages}
            topMessage={topMessage}
            scrollTo={scroll}
            openMessageMenu={openMsgContextMenu}
            chat={chat}
            replyMsg={replyMsg}
            isEdit={isEdit}
          />
          <div ref={scrollTo}></div>
        </div>
        {chat ? (
          <MessageInput
            isEdit={isEdit}
            setEdit={setEdit}
            editMsg={editMessage}
            currentMsg={currentMsg}
            replyTo={replyMsg}
            setReplyTo={setReplyMsg}
            sendMsg={sendMessage}
            secret={chat.secret}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
}
