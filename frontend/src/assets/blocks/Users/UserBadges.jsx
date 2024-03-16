import React, { useContext } from "react";
import { BiShieldQuarter, BiSolidCheckShield } from "react-icons/bi";
import { TranslationContext } from "../../contexts/contexts";

export default function UserBadges({ user }) {
  const { t } = useContext(TranslationContext);
  return (
    <>
      {user && user.isVerified ? <VerifiedBadge /> : ""}
      {user && user.isAdmin ? <AdminBadge /> : ""}
    </>
  );
}

export function AdminBadge() {
  const { t } = useContext(TranslationContext);
  return (
    <BiShieldQuarter
      data-tooltip-id="admin-tooltip"
      data-tooltip-content={t("admin")}
      style={{ color: "var(--greencolor)" }}
      className="no"
    />
  );
}
export function VerifiedBadge() {
  const { t } = useContext(TranslationContext);
  return (
    <BiSolidCheckShield
      data-tooltip-id="verified-tooltip"
      data-tooltip-content={t("verified")}
      style={{ color: "var(--bluecolor)" }}
      className="no"
    />
  );
}
