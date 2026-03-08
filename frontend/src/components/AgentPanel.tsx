"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Tag,
  BookOpen,
  Zap,
  Copy,
  Check,
  Quote,
  GitBranch,
  Search,
} from "lucide-react";
import type { DocumentData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import IntelligenceScoreCard, { BenchmarkComparison } from "./IntelligenceScoreCard";

interface AgentPanelProps {
  document: DocumentData;
}

const CAPABILITY_META: Record<string, { icon: typeof Copy; description: string }> = {
  summarize: { icon: Copy, description: "Copy AI summary to clipboard" },
  cite: { icon: Quote, description: "Copy citation to clipboard" },
  extract_methods: { icon: GitBranch, description: "View methods in knowledge graph" },
  search: { icon: Search, description: "Search document entities" },
};

export default function AgentPanel({ document: doc }: AgentPanelProps) {
  const { agent, benchmarks } = doc;
  const { setActiveTab, setGraphSearchQuery } = useAppStore();
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  async function handleCapabilityClick(cap: string) {
    if (cap === "summarize") {
      const text = agent.summary || "No summary available.";
      await navigator.clipboard.writeText(text);
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

  function getCapIcon(cap: string) {
    const meta = CAPABILITY_META[cap];
    if (!meta) return <Zap className="w-3.5 h-3.5" />;
    if (copiedAction === cap) return <Check className="w-3.5 h-3.5 text-green-400" />;
    const Icon = meta.icon;
    return <Icon className="w-3.5 h-3.5" />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Document type badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Document Intelligence
          </h2>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            {agent.doc_type.replace(/_/g, " ")}
          </span>
          <span className="text-sm text-white/40">
            {Math.round(agent.confidence * 100)}% confidence
          </span>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Summary
          </h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {agent.summary || "No summary available."}
        </p>
      </motion.div>

      {/* Entities */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Entities ({agent.entities.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.entities.slice(0, 20).map((entity, i) => (
            <motion.button
              key={`${entity.name}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className={entityColor(entity.type)}
              onClick={() => {
                setActiveTab("graph");
                setGraphSearchQuery(entity.name);
              }}
              title={`View "${entity.name}" in graph`}
            >
              {entity.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Keywords */}
      {agent.keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">
            Keywords
          </h3>
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
        </motion.div>
      )}

      {/* Agent Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Agent Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {agent.capabilities.map((cap) => (
            <button
              key={cap}
              onClick={() => handleCapabilityClick(cap)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors capitalize"
              title={CAPABILITY_META[cap]?.description || `Run ${cap.replace(/_/g, " ")}`}
            >
              {getCapIcon(cap)}
              {copiedAction === cap ? "Copied!" : cap.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Benchmarks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <IntelligenceScoreCard benchmarks={benchmarks} />
        <BenchmarkComparison benchmarks={benchmarks} />
      </motion.div>
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
