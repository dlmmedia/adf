import { useState } from "react";
import { Icon } from "@iconify/react";
import type { DocumentData } from "@app/types/adf";
import { useAdf } from "@app/contexts/AdfContext";
import IntelligenceScoreCard, { BenchmarkComparison } from "./IntelligenceScoreCard";

interface AgentPanelProps {
  document: DocumentData;
}

const CAPABILITY_META: Record<string, { icon: string; description: string }> = {
  summarize: { icon: "material-symbols:content-copy-outline", description: "Copy AI summary to clipboard" },
  cite: { icon: "material-symbols:format-quote", description: "Copy citation to clipboard" },
  extract_methods: { icon: "material-symbols:account-tree-outline", description: "View methods in knowledge graph" },
  search: { icon: "material-symbols:search", description: "Search document entities" },
};

export default function AgentPanel({ document: doc }: AgentPanelProps) {
  const { agent, benchmarks } = doc;
  const { setActiveTab, setGraphSearchQuery } = useAdf();
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  async function handleCapabilityClick(cap: string) {
    if (cap === "summarize") {
      await navigator.clipboard.writeText(agent.summary || "No summary available.");
      setCopiedAction(cap);
      setTimeout(() => setCopiedAction(null), 2000);
    } else if (cap === "cite") {
      const citation = `${agent.doc_type.replace(/_/g, " ")} — ${agent.keywords.slice(0, 5).join(", ")}. Entities: ${agent.entities.slice(0, 5).map((e) => e.name).join(", ")}.`;
      await navigator.clipboard.writeText(citation);
      setCopiedAction(cap);
      setTimeout(() => setCopiedAction(null), 2000);
    } else if (cap === "extract_methods") {
      setActiveTab("graph");
      setGraphSearchQuery("method");
    } else {
      setActiveTab("graph");
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Document type badge */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="material-symbols:psychology-outline" className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Document Intelligence
          </h2>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Icon icon="material-symbols:menu-book-outline" className="w-3.5 h-3.5" />
            {agent.doc_type.replace(/_/g, " ")}
          </span>
          <span className="text-sm text-white/40">
            {Math.round(agent.confidence * 100)}% confidence
          </span>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="material-symbols:auto-awesome-outline" className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Summary</h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {agent.summary || "No summary available."}
        </p>
      </div>

      {/* Entities */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="material-symbols:label-outline" className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Entities ({agent.entities.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.entities.slice(0, 20).map((entity, i) => (
            <button
              key={`${entity.name}-${i}`}
              className={entityColor(entity.type)}
              onClick={() => {
                setActiveTab("graph");
                setGraphSearchQuery(entity.name);
              }}
              title={`View "${entity.name}" in graph`}
            >
              {entity.name}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords */}
      {agent.keywords.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Keywords</h3>
          <div className="flex flex-wrap gap-1.5">
            {agent.keywords.map((kw) => (
              <button
                key={kw}
                className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs hover:bg-white/10 hover:text-white/70 transition-colors"
                onClick={() => {
                  setActiveTab("graph");
                  setGraphSearchQuery(kw);
                }}
                title={`Search "${kw}" in graph`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="material-symbols:bolt" className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Agent Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {agent.capabilities.map((cap) => (
            <button
              key={cap}
              onClick={() => handleCapabilityClick(cap)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors capitalize"
              title={CAPABILITY_META[cap]?.description || `Run ${cap.replace(/_/g, " ")}`}
            >
              <Icon
                icon={copiedAction === cap ? "material-symbols:check" : (CAPABILITY_META[cap]?.icon || "material-symbols:bolt")}
                className={`w-3.5 h-3.5 ${copiedAction === cap ? "text-green-400" : ""}`}
              />
              {copiedAction === cap ? "Copied!" : cap.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmarks */}
      <div>
        <IntelligenceScoreCard benchmarks={benchmarks} />
        <BenchmarkComparison benchmarks={benchmarks} />
      </div>
    </div>
  );
}

function entityColor(type: string): string {
  const base = "px-2 py-0.5 rounded-md text-xs font-medium border cursor-pointer hover:brightness-125 transition-all";
  const colors: Record<string, string> = {
    person: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    organization: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    method: "bg-green-500/10 border-green-500/20 text-green-400",
    dataset: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    location: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    concept: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    technology: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    keyword: "bg-white/5 border-white/10 text-white/60",
  };
  return `${base} ${colors[type] || colors.keyword}`;
}
