import React, { useContext } from "react";
import {
  BiSolidExit,
  BiSolidMessageAdd,
  BiSolidMoon,
  BiSolidSun,
} from "react-icons/bi";
import { AuthContext } from "../../contexts/contexts";
import { SwitchTheme } from "../../scripts/darklight";

export default function SubMenu({ show }) {
  const user = useContext(AuthContext);
  return (
    <div
      style={{ display: show ? "block" : "none" }}
      className="submenu full-bg"
    >
      <nav className="main">
        <div className="flex user">
          <img src="/static/catuser.png" alt="" />
          <h2 style={{ textAlign: "center" }}>{user.username}</h2>
        </div>
        <hr />
        <div style={{ justifyContent: "space-between" }} className="flex">
          <div className="flex">
            <button>
              <BiSolidMessageAdd />
            </button>
          </div>
          <div className="flex">
            <button onClick={SwitchTheme} id="sun">
              <BiSolidSun />
            </button>
            <button onClick={SwitchTheme} id="moon">
              <BiSolidMoon />
            </button>
            <button>
              <BiSolidExit />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
