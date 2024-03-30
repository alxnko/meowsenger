import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterval } from "../../assets/blocks/hooks/useInterval";
import {
  AuthContext,
  TranslationContext,
} from "../../assets/contexts/contexts";
import { createPostData } from "../../assets/scripts/createPostData";
import { enableNotifications } from "../../assets/scripts/notifications";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useContext(TranslationContext);
  const { user, fetchUser } = useContext(AuthContext);

  const [desc, newDesc] = useState("");
  const [error, setError] = useState("");

  const [isNotify, setIsNotify] = useState(undefined);

  let oldDesc = "";

  useEffect(() => {
    if (user && user.desc != "default") {
      newDesc(user.desc);
    }
    oldDesc = user ? user.desc : "";
  }, [user]);

  useEffect(() => {
    checkNotify();
  }, []);

  useInterval(() => {
    checkNotify();
  }, 2000);

  const save = async (e) => {
    e.preventDefault();
    let dict = {};
    if (desc.trim() != "" && oldDesc != "default") {
      if (desc.length > 2 && desc.length < 21) {
        dict.description = desc;
      } else {
        setError(t("baddata"));
      }
    }
    if (dict != {}) {
      fetch("/api/u/save_settings", createPostData(dict))
        .then((res) => {
          if (res.status != "200") {
            return { status: false };
          }
          return res.json();
        })
        .then(async (data) => {
          if (data.status) {
            fetchUser();
            navigate("/user/" + user.username);
          } else setError(t("unauth"));
        });
    }
  };

  const checkNotify = async () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setIsNotify(Notification.permission == "granted");
      } else {
        setIsNotify(false);
      }
    });
  };

  const handleEnableNotifications = async () => {
    await enableNotifications();
    checkNotify();
  };

  return (
    <div>
      <h2>
        {user ? user.username : ""} {t("settings")}
      </h2>
      <br />
      <form onSubmit={save}>
        <h3>{t("usersettings")}</h3>
        <label htmlFor="desc">{t("description")}</label>
        <input
          className="search"
          id="desc"
          value={desc}
          onChange={(e) => {
            newDesc(e.target.value);
          }}
          placeholder={t("max20")}
        />
        <div className="invalid-feedback">
          <p>{error}</p>
        </div>
        <button className="chat-prev center" type="submit">
          {t("save")}
        </button>
      </form>
      <br />
      <h3>{t("appsettings")}</h3>
      <button
        className="chat-prev center"
        disabled={isNotify == "granted"}
        onClick={handleEnableNotifications}
      >
        {isNotify ? t("notificationsenabled") : t("enablenotifications")}
      </button>
    </div>
  );
}
