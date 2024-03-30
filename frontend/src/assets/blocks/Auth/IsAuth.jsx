import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/contexts";

export default function IsAuth() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user == "unAuth") {
      navigate("/login");
    }
  }, [user]);
  return <></>;
}
