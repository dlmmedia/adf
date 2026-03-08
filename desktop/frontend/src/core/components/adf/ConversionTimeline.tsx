import { Icon } from "@iconify/react";
import type { ConversionStatus } from "@app/types/adf";

const STEPS = [
  { key: "extraction", label: "Text Extraction", icon: "material-symbols:document-scanner-outline" },
  { key: "structure", label: "Structure Detection", icon: "material-symbols:layers-outline" },
  { key: "enrichment", label: "Semantic Analysis", icon: "material-symbols:psychology-outline" },
  { key: "embedding", label: "Embedding Generation", icon: "material-symbols:layers-outline" },
  { key: "packaging", label: "Packaging ADF", icon: "material-symbols:package-2-outline" },
] as const;

interface ConversionTimelineProps {
  status: ConversionStatus;
}

export default function ConversionTimeline({ status }: ConversionTimelineProps) {
  const currentStepIdx = STEPS.findIndex((s) => s.key === status.step);
  const isComplete = status.status === "completed";
  const isFailed = status.status === "failed";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
        <div className="relative h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${isFailed ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
            style={{ width: `${status.progress * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const isActive = step.key === status.step;
            const isDone = isComplete || i < currentStepIdx;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${isActive ? "bg-white/[0.04]" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isDone ? "bg-green-500/20 text-green-400" : isActive ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/20"
                  }`}
                >
                  {isDone ? (
                    <Icon icon="material-symbols:check" className="w-4 h-4" />
                  ) : isActive ? (
                    <Icon icon="material-symbols:progress-activity" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon icon={step.icon} className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${isDone ? "text-white/70" : isActive ? "text-white" : "text-white/30"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <MetricCard label="Sections" value={status.sections_detected} />
          <MetricCard label="Entities" value={status.entities_extracted} />
          <MetricCard label="Confidence" value={status.confidence > 0 ? `${Math.round(status.confidence * 100)}%` : "—"} />
        </div>

        {isFailed && (
          <p className="mt-4 text-red-400 text-sm text-center">{status.message}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}
