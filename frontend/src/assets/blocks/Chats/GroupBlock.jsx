import React, { useContext } from "react";
import { BiExit, BiSolidCog, BiSolidGroup } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, TranslationContext } from "../../contexts/contexts";
import { createPostData } from "../../scripts/createPostData";
import { encrypt } from "../../scripts/encryption";

export default function GroupBlock({ group, openUserList, openAdminPanel }) {
  const { t } = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const leave = () => {
    fetch(
      "/api/c/leave_group",
      createPostData({
        from: group.id,
        message: encrypt("leftgroup ", group.secret),
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
        }
      });
  };

  return (
    <>
      <div className="flex user">
        <div className="flex">
          <img className="user-block-image" src="/static/catuser.png" alt="" />
          <div className="flex data">
            <h2>{group ? group.name : ""}</h2>
            <p>{t("members") + ": " + group.users.length}</p>
          </div>
        </div>
        <Link>
          <button
            onClick={() => {
              openUserList(true);
            }}
          >
            <BiSolidGroup />
          </button>
        </Link>
      </div>
      <p className="center">{group.desc}</p>
      <div className="flex-center">
        {user && group.admins.includes(user.username) ? (
          <Link>
            <button
              onClick={() => {
                openAdminPanel(true);
              }}
            >
              <BiSolidCog />
            </button>
          </Link>
        ) : (
          ""
        )}
        <Link>
          <button
            onClick={() => {
              leave();
            }}
          >
            <BiExit />
          </button>
        </Link>
      </div>
    </>
  );
}
