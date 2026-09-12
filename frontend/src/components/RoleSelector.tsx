import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export type Role = "importer" | "carrier" | "warehouse";

interface RoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onSelectRole,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex rounded-xl p-1 bg-[#0F172A] border border-white/10 w-full shadow-inner">
      <button
        onClick={() => onSelectRole("importer")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "importer"
            ? "bg-[#0A58CA] text-white shadow-md shadow-[#0A58CA]/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        1. {t.roles.importer}
      </button>
      <button
        onClick={() => onSelectRole("carrier")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "carrier"
            ? "bg-[#E84142] text-white shadow-md shadow-[#E84142]/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        2. {t.roles.carrier}
      </button>
      <button
        onClick={() => onSelectRole("warehouse")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "warehouse"
            ? "bg-[#0A58CA] text-white shadow-md shadow-[#0A58CA]/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        3. {t.roles.warehouse}
      </button>
    </div>
  );
};
