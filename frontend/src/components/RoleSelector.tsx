import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export type Role = "importer" | "carrier";

interface RoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

// When shown to a carrier, these tabs switch between "My Panel" and "Order Details"
// They are NOT shown to importers at all (importers are role-locked in page.tsx)
const TruckIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const TABS: { id: Role; icon: React.ReactNode; labelEs: string; labelEn: string }[] = [
  { id: "carrier",  icon: <TruckIcon />,   labelEs: "Mi Panel",       labelEn: "My Panel" },
  { id: "importer", icon: <DocumentIcon />, labelEs: "Orden del Flete", labelEn: "Order Details" },
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
          className={`rp-tab flex items-center justify-center ${currentRole === tab.id ? "active" : ""}`}
        >
          {tab.icon}
          {isEs ? tab.labelEs : tab.labelEn}
        </button>
      ))}
    </div>
  );
};
