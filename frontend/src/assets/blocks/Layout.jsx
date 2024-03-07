import React, { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext, LoaderContext } from "../contexts/contexts";
import Loader from "./Loader/Loader";
import Menu from "./Menu/Menu";
import SubMenu from "./Menu/SubMenu";

export default function Layout() {
  const user = useContext(AuthContext);
  const [isLoader] = useContext(LoaderContext);
  const [isMenuOpen, openMenu] = useState(false);
  const [isOnTop, setOnTop] = useState(window.location.href.includes("/chat/"));
  const navigate = useNavigate();
  useEffect(() => {
    setOnTop(
      window.location.href.includes("/chat/") ||
        window.location.href.includes("/group/")
    );
  }, [navigate]);
  const switchMenu = () => {
    if (isMenuOpen) {
      openMenu(false);
    } else {
      openMenu(true);
    }
  };
  return (
    <>
      <SubMenu isOnTop={isOnTop} show={isMenuOpen} openMenu={openMenu} />
      <Loader show={isLoader} />
      <Menu isOnTop={isOnTop} user={user} switchMenu={switchMenu} />
      <main>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
