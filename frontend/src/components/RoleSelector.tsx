import React from "react";

export type Role = "importer" | "carrier" | "warehouse";

interface RoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onSelectRole,
}) => {
  return (
    <div className="flex rounded-xl p-1 bg-[#18181B] border border-white/10 w-full shadow-inner">
      <button
        onClick={() => onSelectRole("importer")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "importer"
            ? "bg-[#E84142] text-white shadow-md shadow-[#E84142]/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        1. Importador
      </button>
      <button
        onClick={() => onSelectRole("carrier")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "carrier"
            ? "bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/50 border border-blue-400/30"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        2. Transportista
      </button>
      <button
        onClick={() => onSelectRole("warehouse")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentRole === "warehouse"
            ? "bg-[#E84142] text-white shadow-md shadow-[#E84142]/40"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        3. Tap Tangem
      </button>
    </div>
  );
};
