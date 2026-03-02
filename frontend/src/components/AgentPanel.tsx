"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Tag, BookOpen, Zap } from "lucide-react";
import type { DocumentData } from "@/lib/api";
import IntelligenceScoreCard, { BenchmarkComparison } from "./IntelligenceScoreCard";

interface AgentPanelProps {
  document: DocumentData;
}

export default function AgentPanel({ document: doc }: AgentPanelProps) {
  const { agent, benchmarks } = doc;

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
            <motion.span
              key={`${entity.name}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className={entityColor(entity.type)}
            >
              {entity.name}
            </motion.span>
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
              <span
                key={kw}
                className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs"
              >
                {kw}
              </span>
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
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors capitalize"
            >
              {cap.replace(/_/g, " ")}
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
  const base = "px-2 py-0.5 rounded-md text-xs font-medium border";
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
