import React, { useEffect, useState } from "react";

export default function Notification({ data }) {
  const [message, setMessage] = useState(undefined);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (data) {
      let msg = data.split(":");
      if (
        !window.location.href.includes("/chat/" + msg[0]) &&
        !window.location.href.includes("/group/" + msg[2])
      ) {
        setMessage(msg);
      }
    } else {
      setMessage(undefined);
    }
  }, [data]);
  return (
    <div
      style={{ display: message ? "block" : "none" }}
      className="notification"
      onClick={() => {
        setMessage(undefined);
      }}
    >
      <div className="chat-prev body">
        <p>{message ? message[0] : ""}</p>
        <h2>{message ? message[1] : ""}</h2>
      </div>
    </div>
  );
}
