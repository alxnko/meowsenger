import React, { useContext, useEffect, useState } from "react";
import {
  BiSolidLogOut,
  BiSolidMessageAdd,
  BiSolidMoon,
  BiSolidSun,
} from "react-icons/bi";
import { FaLanguage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  MenuContext,
  TranslationContext,
} from "../../contexts/contexts";
import { SwitchTheme } from "../../scripts/darklight";
import { setLang } from "../../scripts/language";
import { hideMe, stopPropag } from "../../scripts/stopPropag";
import PopUp from "../PopUps/PopUp";
import UserBlock from "../Users/UserBlock";

export default function SubMenu({ isOnTop, show, openMenu }) {
  const { t } = useContext(TranslationContext);
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const [isLang, SetIsLang] = useState(false);
  const { menu } = useContext(MenuContext);
  useEffect(() => {
    hideMe(openMenu);
  }, [navigate]);
  const { user } = useContext(AuthContext);

  const logout = () => {
    fetch("/api/u/logout")
      .then((res) => {
        if (res.status != "200") {
          return { status: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.status) {
          fetchUser();
          navigate("/login");
        }
      });
  };
  return (
    <>
      <PopUp show={isLang} setIsShow={SetIsLang}>
        <h3 className="center">{t("lang")}</h3>
        <br />
        <button
          onClick={() => {
            setLang("en");
            SetIsLang(false);
          }}
        >
          English
        </button>
        <button
          onClick={() => {
            setLang("ru");
            SetIsLang(false);
          }}
        >
          Русский
        </button>
      </PopUp>
      <div
        onClick={() => {
          hideMe(openMenu);
        }}
        style={{ display: show ? "block" : "none" }}
        className="submenu full-bg"
      >
        <nav
          style={
            isOnTop
              ? {
                  top: "0",
                  padding: "85px 10px 10px 10px",
                  borderRadius: "0 0 30px 30px",
                }
              : {
                  bottom: "0",
                  padding: "10px 10px 85px 10px",
                  borderRadius: "30px 30px 0 0",
                }
          }
          onClick={stopPropag}
          className="main"
        >
          {menu ? menu : ""}
          {user != "unAuth" ? (
            <>
              <UserBlock user={user} />
              <hr />
            </>
          ) : (
            ""
          )}
          <div
            style={{
              justifyContent: user == "unAuth" ? "center" : "space-between",
            }}
            className="flex"
          >
            <div className="flex"></div>
            <div className="flex">
              <button
                onClick={() => {
                  SetIsLang(true);
                }}
              >
                <FaLanguage />
              </button>
              <button onClick={SwitchTheme} id="sun">
                <BiSolidSun />
              </button>
              <button onClick={SwitchTheme} id="moon">
                <BiSolidMoon />
              </button>
              {user != "unAuth" ? (
                <button onClick={logout}>
                  <BiSolidLogOut />
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
