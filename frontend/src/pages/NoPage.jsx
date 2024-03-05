import { t } from "i18next";
import React from "react";

export default function NoPage() {
  return (
    <div>
      <h1>{t("error404")}</h1>
    </div>
  );
}
