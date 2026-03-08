import { useAdf } from "@app/contexts/AdfContext";
import SemanticViewer from "./SemanticViewer";
import AgentPanel from "./AgentPanel";

export default function AdfSidebarPanel() {
  const { isAdfLoaded, document, activeTab, setActiveTab } = useAdf();

  if (!isAdfLoaded || !document) return null;

  return (
    <div className="flex flex-col h-full border-l border-white/10 bg-[#0d1017]" style={{ width: 340 }}>
      {/* Tab header */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab("viewer")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "viewer"
              ? "text-blue-400 border-b-2 border-blue-400 bg-white/[0.02]"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Structure
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "graph"
              ? "text-blue-400 border-b-2 border-blue-400 bg-white/[0.02]"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Intelligence
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "viewer" ? (
          <SemanticViewer sections={document.semantic.sections} />
        ) : (
          <AgentPanel document={document} />
        )}
      </div>
    </div>
  );
}
