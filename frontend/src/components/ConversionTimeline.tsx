"use client";

import { motion } from "framer-motion";
import { Check, Loader2, FileSearch, Brain, Layers, Package } from "lucide-react";
import type { ConversionStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "extraction", label: "Text Extraction", icon: FileSearch },
  { key: "structure", label: "Structure Detection", icon: Layers },
  { key: "enrichment", label: "Semantic Analysis", icon: Brain },
  { key: "embedding", label: "Embedding Generation", icon: Layers },
  { key: "packaging", label: "Packaging ADF", icon: Package },
] as const;

interface ConversionTimelineProps {
  status: ConversionStatus;
}

export default function ConversionTimeline({ status }: ConversionTimelineProps) {
  const currentStepIdx = STEPS.findIndex((s) => s.key === status.step);
  const isComplete = status.status === "completed";
  const isFailed = status.status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
        {/* Progress bar */}
        <div className="relative h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              isFailed ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
            )}
            initial={{ width: "0%" }}
            animate={{ width: `${status.progress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.key === status.step;
            const isDone = isComplete || i < currentStepIdx;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex items-center gap-4 py-2 px-3 rounded-lg transition-colors",
                  isActive && "bg-white/[0.04]"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isDone
                      ? "bg-green-500/20 text-green-400"
                      : isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white/20"
                  )}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isDone
                      ? "text-white/70"
                      : isActive
                      ? "text-white"
                      : "text-white/30"
                  )}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Live metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <MetricCard label="Sections" value={status.sections_detected} />
          <MetricCard label="Entities" value={status.entities_extracted} />
          <MetricCard
            label="Confidence"
            value={status.confidence > 0 ? `${Math.round(status.confidence * 100)}%` : "—"}
          />
        </motion.div>

        {isFailed && (
          <p className="mt-4 text-red-400 text-sm text-center">{status.message}</p>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-4 text-center">
      <motion.p
        key={String(value)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-white"
      >
        {value}
      </motion.p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}
