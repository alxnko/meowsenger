import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./assets/blocks/Layout";
import {
  AuthContext,
  LoaderContext,
  MenuContext,
  TranslationContext,
} from "./assets/contexts/contexts";
import { DetectTheme } from "./assets/scripts/darklight";
import "./assets/scripts/i18n";
import setTrueVH from "./assets/scripts/truevh";
import Main from "./pages/Main";
import NoPage from "./pages/NoPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Chat from "./pages/chats/Chat";
import Chats from "./pages/chats/Chats";

export default function App() {
  const { i18n, t } = useTranslation();
  const [isLoader, setIsLoader] = useState(true);
  const [user, setUser] = useState(undefined);
  const [menu, setMenu] = useState(undefined);
  useEffect(() => {
    setTrueVH();
    DetectTheme();
    fetch("/api/u/get_current_user")
      .then((res) => {
        if (res.status != "200") {
          return undefined;
        }
        return res.json();
      })
      .then((data) => {
        if (typeof data === "object") {
          if ("id" in data) setUser(data);
          else setUser("unAuth");
          setIsLoader(false);
        }
      });
  }, []);
  return (
    <TranslationContext.Provider value={{ t, i18n }}>
      <AuthContext.Provider value={user}>
        <LoaderContext.Provider value={[isLoader, setIsLoader]}>
          <MenuContext.Provider value={{ menu, setMenu }}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Main />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="chats" element={<Chats />} />
                  <Route path="chat/:username" element={<Chat />} />
                  <Route path="group/:groupid" element={<Chat />} />
                  <Route path="*" element={<NoPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </MenuContext.Provider>
        </LoaderContext.Provider>
      </AuthContext.Provider>
    </TranslationContext.Provider>
  );
}
