import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/contexts";

export default function IsNotAuth() {
  const user = useContext(AuthContext);
  if (user != {}) {
    return <Navigate to="/chats" />;
  }

  return <></>;
}
