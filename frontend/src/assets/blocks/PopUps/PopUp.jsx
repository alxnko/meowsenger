import React from "react";
import { hideMe, stopPropag } from "../../scripts/stopPropag";

export default function PopUp({ children, show, setIsShow }) {
  return (
    <div
      onClick={() => {
        hideMe(setIsShow);
      }}
      style={{ display: show ? "flex" : "none", zIndex: 9999 }}
      className="full-bg"
    >
      <div onClick={stopPropag} className="popup">
        {children}
      </div>
    </div>
  );
}
