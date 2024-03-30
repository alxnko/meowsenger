import React, { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext, LoaderContext } from "../contexts/contexts";
import { enableNotifications } from "../scripts/notifications";
import Loader from "./Loader/Loader";
import Menu from "./Menu/Menu";
import SubMenu from "./Menu/SubMenu";
import Notification from "./Messages/Notification";

export default function Layout() {
  const { isLoader } = useContext(LoaderContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, openMenu] = useState(false);
  const [isOnTop, setOnTop] = useState(window.location.href.includes("/chat/"));
  const [updateMessage, setUpdateMessage] = useState(undefined);
  const navigate = useNavigate();

  let timeOut = undefined;

  const notifications = new BroadcastChannel("notifications");

  async function ask() {
    if (
      user &&
      user != "unAuth" &&
      !localStorage.hasOwnProperty("notifyAsked")
    ) {
      await enableNotifications();
      localStorage.setItem("notifyAsked", true);
    }
  }

  useEffect(() => {
    ask();
  }, []);

  useEffect(() => {
    setOnTop(
      window.location.href.includes("/chat/") ||
        window.location.href.includes("/group/")
    );
    ask();
  }, [navigate]);

  notifications.onmessage = (event) => {
    if (timeOut) {
      clearTimeout(timeOut);
      timeOut = undefined;
    }
    setUpdateMessage(event.data.update);
    timeOut = setTimeout(() => {
      setUpdateMessage(undefined);
    }, 1000);
  };

  const switchMenu = () => {
    if (isMenuOpen) {
      openMenu(false);
    } else {
      openMenu(true);
    }
  };
  return (
    <>
      <Notification data={updateMessage} />
      <SubMenu isOnTop={isOnTop} show={isMenuOpen} openMenu={openMenu} />
      <Loader show={isLoader} />
      <Menu isOnTop={isOnTop} switchMenu={switchMenu} />
      <main>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
