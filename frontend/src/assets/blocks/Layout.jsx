import React, { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LoaderContext } from "../contexts/contexts";
import Loader from "./Loader/Loader";
import Menu from "./Menu/Menu";
import SubMenu from "./Menu/SubMenu";
import Notification from "./Messages/Notification";

export default function Layout() {
  const { isLoader } = useContext(LoaderContext);
  const [isMenuOpen, openMenu] = useState(false);
  const [isOnTop, setOnTop] = useState(window.location.href.includes("/chat/"));
  const [updateMessage, setUpdateMessage] = useState(undefined);
  const navigate = useNavigate();

  let timeOut = undefined;

  const notifications = new BroadcastChannel("notifications");

  useEffect(() => {
    setOnTop(
      window.location.href.includes("/chat/") ||
        window.location.href.includes("/group/")
    );
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
