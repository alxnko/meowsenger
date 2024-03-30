import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, LoaderContext } from "../../contexts/contexts";

export default function IsNotAuth() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setIsLoader } = useContext(LoaderContext);
  useEffect(() => {
    if (user) {
      if (user != "unAuth") {
        navigate("/chats");
      } else {
        setIsLoader(false);
      }
    }
  }, [user]);
  return <></>;
}
