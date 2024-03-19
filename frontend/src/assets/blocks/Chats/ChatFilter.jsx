import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { TranslationContext } from "../../contexts/contexts";

export default function ChatFilter({ filter, setFilter }) {
  const { t } = useContext(TranslationContext);
  return (
    <div className="flex">
      <Link className={filter == "" ? "active" : ""}>
        <button
          onClick={() => setFilter("")}
          style={{ marginRight: "5px" }}
          className="chat-prev center w4"
        >
          {t("all")}
        </button>
      </Link>
      <Link className={filter == "u" ? "active" : ""}>
        <button
          onClick={() => setFilter("u")}
          style={{ marginLeft: "5px", marginRight: "5px" }}
          className="chat-prev center w4"
        >
          {t("u.")}
        </button>
      </Link>
      <Link className={filter == "g" ? "active" : ""}>
        <button
          onClick={() => setFilter("g")}
          style={{ marginLeft: "5px", marginRight: "5px" }}
          className="chat-prev center w4"
        >
          {t("g.")}
        </button>
      </Link>
      <Link className={filter == "c" ? "active" : ""}>
        <button
          onClick={() => setFilter("c")}
          style={{ marginLeft: "5px" }}
          className="chat-prev center w4"
        >
          {t("c.")}
        </button>
      </Link>
    </div>
  );
}
