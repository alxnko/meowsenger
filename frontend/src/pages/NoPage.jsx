import React, { useContext } from "react";
import { TranslationContext } from "../assets/contexts/contexts";

export default function NoPage() {
  const { t } = useContext(TranslationContext);
  return (
    <div>
      <h1>{t("error404")}</h1>
    </div>
  );
}
