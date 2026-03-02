"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphNode, GraphEdge } from "@/lib/api";

interface GraphExplorerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const TYPE_COLORS: Record<string, string> = {
  document: "#3b82f6",
  person: "#8b5cf6",
  organization: "#a855f7",
  method: "#10b981",
  dataset: "#f59e0b",
  location: "#06b6d4",
  concept: "#ec4899",
  technology: "#eab308",
  keyword: "#6b7280",
};

export default function GraphExplorer({ nodes: graphNodes, edges: graphEdges }: GraphExplorerProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      graphNodes.map((n, i) => {
        const angle = (2 * Math.PI * i) / graphNodes.length;
        const radius = 200 + Math.random() * 80;
        return {
          id: n.id,
          data: { label: n.label },
          position: {
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
          },
          style: {
            background: TYPE_COLORS[n.type] || TYPE_COLORS.keyword,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 500,
          },
        };
      }),
    [graphNodes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        label: e.relationship,
        animated: true,
        style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
        labelStyle: { fill: "rgba(255,255,255,0.4)", fontSize: 10 },
      })),
    [graphEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full" style={{ minHeight: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <Controls
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>
    </div>
  );
}
