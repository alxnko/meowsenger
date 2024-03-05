import React from "react";
import { Link } from "react-router-dom";

export default function Menu({ user, switchMenu }) {
  return (
    <div className="menu">
      {user ? (
        <Link to="/chats">
          <button>chats</button>
        </Link>
      ) : (
        <Link to="/login">
          <button>log in</button>
        </Link>
      )}
      <button onClick={switchMenu} className="logo-btn">
        <img className="logo" src="/static/catuser.png" alt="logo" />
      </button>
      {user ? (
        <Link to="/me">
          <button>me</button>
        </Link>
      ) : (
        <Link to="/signup">
          <button>sign up</button>
        </Link>
      )}
    </div>
  );
}
