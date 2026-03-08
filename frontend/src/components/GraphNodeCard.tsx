"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  FileText,
  User,
  Building2,
  Beaker,
  Database,
  MapPin,
  Lightbulb,
  Cpu,
  Hash,
} from "lucide-react";

const TYPE_ICONS: Record<string, typeof FileText> = {
  document: FileText,
  person: User,
  organization: Building2,
  method: Beaker,
  dataset: Database,
  location: MapPin,
  concept: Lightbulb,
  technology: Cpu,
  keyword: Hash,
};

export const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  document: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.35)", text: "#60a5fa", glow: "rgba(59,130,246,0.15)" },
  person: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)", text: "#a78bfa", glow: "rgba(139,92,246,0.15)" },
  organization: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", text: "#c084fc", glow: "rgba(168,85,247,0.15)" },
  method: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", text: "#34d399", glow: "rgba(16,185,129,0.15)" },
  dataset: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24", glow: "rgba(245,158,11,0.15)" },
  location: { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.35)", text: "#22d3ee", glow: "rgba(6,182,212,0.15)" },
  concept: { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.35)", text: "#f472b6", glow: "rgba(236,72,153,0.15)" },
  technology: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.35)", text: "#facc15", glow: "rgba(234,179,8,0.15)" },
  keyword: { bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.35)", text: "#9ca3af", glow: "rgba(107,114,128,0.15)" },
};

export interface GraphNodeData {
  label: string;
  type: string;
  description: string;
  importance: number;
  dimmed: boolean;
  highlighted: boolean;
}

function GraphNodeCard({ data, selected }: NodeProps & { data: GraphNodeData }) {
  const colors = TYPE_COLORS[data.type] || TYPE_COLORS.keyword;
  const Icon = TYPE_ICONS[data.type] || Hash;
  const importance = data.importance ?? 0.5;
  const scale = 0.85 + importance * 0.3;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-2 !h-2" />
      <div
        className="transition-all duration-200"
        style={{
          opacity: data.dimmed ? 0.25 : 1,
          transform: `scale(${scale})`,
          filter: data.highlighted ? `drop-shadow(0 0 12px ${colors.glow})` : undefined,
        }}
      >
        <div
          className="rounded-xl px-4 py-3 min-w-[140px] max-w-[220px] cursor-pointer"
          style={{
            background: colors.bg,
            border: `1.5px solid ${selected ? colors.text : colors.border}`,
            boxShadow: selected ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}` : undefined,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: colors.border }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: colors.text }} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
              {data.type}
            </span>
          </div>

          <p className="text-sm font-semibold text-white/90 leading-tight mb-1 line-clamp-2">
            {data.label}
          </p>

          {data.description && (
            <p className="text-[11px] text-white/45 leading-snug line-clamp-2">
              {data.description}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-2 !h-2" />
    </>
  );
}

export default memo(GraphNodeCard);
