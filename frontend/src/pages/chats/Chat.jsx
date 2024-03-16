import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IsAuth from "../../assets/blocks/Auth/IsAuth";
import GroupBlock from "../../assets/blocks/Chats/GroupBlock";
import Message from "../../assets/blocks/Messages/Message";
import MessageInput from "../../assets/blocks/Messages/MessageInput";
import PopUp from "../../assets/blocks/PopUps/PopUp";
import TPopUp from "../../assets/blocks/PopUps/TPopUp";
import {
  AdminBadge,
  VerifiedBadge,
} from "../../assets/blocks/Users/UserBadges";
import UserBlock from "../../assets/blocks/Users/UserBlock";
import {
  AuthContext,
  LoaderContext,
  MenuContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";
import { decrypt, encrypt } from "../../assets/scripts/encryption";

export default function Chat() {
  const navigate = useNavigate();
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);

  const { username } = useParams();
  const { groupId } = useParams();
  const fetchURL = username ? "/api/c/get_chat" : "/api/c/get_group";

  const [chat, setChat] = useState(undefined);
  let chatId = undefined;
  const [messages, setMessages] = useState(undefined);
  let last = undefined;
  const scrollTo = useRef(null);

  const [isMsgMenuOpen, setMsgMenuOpen] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(undefined);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [isUserListOpen, setUserListOpen] = useState(false);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);

  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");

  const [isDeleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [password, setPassword] = useState("");

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
    )
      .then((res) => {
        if (res.status != "200") {
          return { status: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          setAddUserOpen(false);
          setNewUsername("");
          fetchChat();
        } else setError(t("nouser"));
      });
  };

  const removeUser = (un) => {
    fetch(
      "/api/c/remove_member",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("removed " + un, chat.secret),
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
          fetchChat();
        }
      });
  };

  const addAdmin = (un) => {
    fetch(
      "/api/c/add_admin",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("gaveadminrightsto " + un, chat.secret),
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
          fetchChat();
        }
      });
  };

  const removeAdmin = (un) => {
    fetch(
      "/api/c/remove_admin",
      createPostData({
        from: chat.id,
        username: un,
        message: encrypt("tookawayadminrightsfrom " + un, chat.secret),
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
          fetchChat();
        }
      });
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

  const { setMenu } = useContext(MenuContext);
  const { setIsLoader } = useContext(LoaderContext);

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  useEffect(() => {
    if (chat && user) {
      setIsAdmin(chat.admins.includes(user.username));
      setIsOwner(user.username == chat.admins[0]);
    }
  }, [user, chat]);

  useEffect(() => {
    setIsLoader(true);
    fetchChat();
    const newMessages = setInterval(() => {
      fetchData();
    }, 500);
    return () => {
      clearInterval(newMessages);
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
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setChatData(data);
      });
  };
  const setChatData = (data) => {
    if (data) {
      if (data.status) {
        if ("chat" in data) {
          setChat(data.chat);
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
          last =
            data.messages && data.messages.length
              ? data.messages[data.messages.length - 1].id
              : 0;
        }
        setIsLoader(false);
      } else {
        navigate("/chats");
      }
    }
  };

  const sendMessage = (text) => {
    fetch(
      "/api/m/send",
      createPostData({
        id: chat.id,
        text: encrypt(text, chat.secret),
      })
    );
  };

  const fetchData = () => {
    if (chatId && last) {
      fetch(
        "/api/m/get_new",
        createPostData({
          id: chatId,
          last: last,
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
        });
    } else {
      return [];
    }
  };
  const setMessagesData = (data) => {
    if (data) {
      if (data.status) {
        if ("messages" in data) {
          if (
            data.messages.filter((msg) => {
              msg.isSystem;
            })
          ) {
            fetchChat();
          }
          setMessages((messages) => [...messages, ...data.messages]);
          last =
            data.messages && data.messages.length
              ? data.messages[data.messages.length - 1].id
              : last;
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

  const openMsgContextMenu = (id) => {
    setCurrentMsg(messages[id]);
    setMsgMenuOpen(true);
  };

  return (
    <>
      <IsAuth />
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
                  <input
                    className="chat-prev center"
                    type="submit"
                    value="OK"
                  />
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
                  <button className="chat-prev center" type="submit">
                    OK
                  </button>
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
      <div style={{ scrollPaddingBottom: "80px" }}>
        <div className="flex-center chat-title">
          <h2 style={{ fontSize: "20px" }}>
            {chat
              ? chat.isGroup
                ? " g." + chat.name
                : "u." + chat.name
              : t("loading") + "..."}
            {chat && chat.isVerified ? <VerifiedBadge /> : ""}
            {chat && chat.isAdmin ? <AdminBadge /> : ""}
          </h2>
        </div>
        <div className="messages">
          {messages ? (
            messages.map((message, index) => (
              <Message
                key={message.id}
                openContextMenu={() => openMsgContextMenu(index)}
                message={message}
                secret={chat.secret}
              />
            ))
          ) : (
            <p className="msg msg-info">{t("startchatting")}</p>
          )}
          <div ref={scrollTo}></div>
        </div>
        {chat ? <MessageInput sendMsg={sendMessage} /> : ""}
      </div>
    </>
  );
}
