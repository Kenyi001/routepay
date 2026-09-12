import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export type Role = "importer" | "carrier";

interface RoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

// When shown to a carrier, these tabs switch between "My Panel" and "Order Details"
// They are NOT shown to importers at all (importers are role-locked in page.tsx)
const TABS: { id: Role; emoji: string; labelEs: string; labelEn: string }[] = [
  { id: "carrier",  emoji: "🚛", labelEs: "Mi Panel",       labelEn: "My Panel" },
  { id: "importer", emoji: "📋", labelEs: "Orden del Flete", labelEn: "Order Details" },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onSelectRole }) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <div className="rp-tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectRole(tab.id)}
          className={`rp-tab ${currentRole === tab.id ? "active" : ""}`}
        >
          <span className="mr-1">{tab.emoji}</span>
          {isEs ? tab.labelEs : tab.labelEn}
        </button>
      ))}
    </div>
  );
};
