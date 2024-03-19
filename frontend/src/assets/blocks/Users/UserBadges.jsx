import React, { useContext } from "react";
import { BiShieldQuarter, BiSolidCheckShield } from "react-icons/bi";
import { GiGearHammer } from "react-icons/gi";
import { TranslationContext } from "../../contexts/contexts";

export default function UserBadges({ user }) {
  const { t } = useContext(TranslationContext);
  return (
    <>
      {user ? (
        <>
          {user.isTester ? <TesterBadge /> : ""}
          {user.isVerified ? <VerifiedBadge /> : ""}
          {user.isAdmin ? <AdminBadge /> : ""}
        </>
      ) : (
        ""
      )}
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
export function TesterBadge() {
  const { t } = useContext(TranslationContext);
  return (
    <GiGearHammer
      data-tooltip-id="tester-tooltip"
      data-tooltip-content={t("tester")}
      className="no"
    />
  );
}
