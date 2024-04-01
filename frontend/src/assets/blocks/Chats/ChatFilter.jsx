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
          className="chat-prev center w3"
        >
          {t("all")}
        </button>
      </Link>
      <Link className={filter == "u" ? "active" : ""}>
        <button
          onClick={() => setFilter("u")}
          style={{ marginLeft: "5px", marginRight: "5px" }}
          className="chat-prev center w3"
        >
          u.
        </button>
      </Link>
      <Link className={filter == "g" ? "active" : ""}>
        <button
          onClick={() => setFilter("g")}
          style={{ marginLeft: "5px", marginRight: "5px" }}
          className="chat-prev center w3"
        >
          g.
        </button>
      </Link>
    </div>
  );
}
