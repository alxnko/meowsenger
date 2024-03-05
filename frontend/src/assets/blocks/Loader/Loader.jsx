import React from "react";

export default function Loader({ show }) {
  return (
    <div style={{ display: show ? "flex" : "none" }} className="loader full-bg">
      <span className="loader"></span>
    </div>
  );
}
