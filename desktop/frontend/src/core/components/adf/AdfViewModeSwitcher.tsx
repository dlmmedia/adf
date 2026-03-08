import { Icon } from "@iconify/react";
import { useAdf } from "@app/contexts/AdfContext";
import type { AdfViewMode } from "@app/types/adf";

const VIEW_MODES: { mode: AdfViewMode; label: string; icon: string }[] = [
  { mode: "pdf", label: "Document", icon: "material-symbols:description-outline" },
  { mode: "semantic", label: "Semantic", icon: "material-symbols:format-list-bulleted" },
  { mode: "hybrid", label: "Hybrid", icon: "material-symbols:vertical-split-outline" },
  { mode: "graph", label: "Graph", icon: "material-symbols:hub-outline" },
];

export default function AdfViewModeSwitcher() {
  const { isAdfLoaded, viewMode, setViewMode } = useAdf();

  if (!isAdfLoaded) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white/[0.03] rounded-lg border border-white/10">
      {VIEW_MODES.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === mode
              ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
              : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
          }`}
          title={`Switch to ${label} view`}
        >
          <Icon icon={icon} className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
