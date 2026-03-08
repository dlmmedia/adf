"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence } from "framer-motion";
import Dagre from "@dagrejs/dagre";
import {
  Maximize2,
  RotateCcw,
  Type,
  Download,
  Search,
  X,
  GitBranch,
} from "lucide-react";
import type { GraphNode as GNode, GraphEdge as GEdge } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import GraphNodeCardComponent, { TYPE_COLORS, type GraphNodeData } from "./GraphNodeCard";
import GraphDetailPanel from "./GraphDetailPanel";

const nodeTypes = { custom: GraphNodeCardComponent };

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80, edgesep: 30 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function edgeStyleForRelationship(relationship: string): React.CSSProperties {
  const r = relationship.toLowerCase();
  if (r.includes("contains") || r.includes("part of") || r.includes("includes")) {
    return { strokeDasharray: "none" };
  }
  if (r.includes("reference") || r.includes("cite")) {
    return { strokeDasharray: "4 4" };
  }
  return { strokeDasharray: "8 4" };
}

interface GraphExplorerInnerProps {
  nodes: GNode[];
  edges: GEdge[];
}

function GraphExplorerInner({ nodes: graphNodes, edges: graphEdges }: GraphExplorerInnerProps) {
  const { fitView, getNodes } = useReactFlow();
  const {
    selectedNodeId,
    setSelectedNodeId,
    graphSearchQuery,
    setGraphSearchQuery,
    graphTypeFilters,
    toggleGraphTypeFilter,
  } = useAppStore();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTypes = useMemo(() => {
    const types = new Set<string>();
    graphNodes.forEach((n) => types.add(n.type));
    return Array.from(types).sort();
  }, [graphNodes]);

  const connectedToHovered = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>([hoveredNodeId]);
    graphEdges.forEach((e) => {
      if (e.source === hoveredNodeId) ids.add(e.target);
      if (e.target === hoveredNodeId) ids.add(e.source);
    });
    return ids;
  }, [hoveredNodeId, graphEdges]);

  const searchLower = graphSearchQuery.toLowerCase();

  const visibleNodeIds = useMemo(() => {
    return new Set(
      graphNodes
        .filter((n) => {
          if (graphTypeFilters.size > 0 && !graphTypeFilters.has(n.type)) return false;
          return true;
        })
        .map((n) => n.id)
    );
  }, [graphNodes, graphTypeFilters]);

  const initialNodes: Node[] = useMemo(
    () =>
      graphNodes
        .filter((n) => visibleNodeIds.has(n.id))
        .map((n) => {
          const matchesSearch =
            !searchLower ||
            n.label.toLowerCase().includes(searchLower) ||
            n.type.toLowerCase().includes(searchLower) ||
            (n.description || "").toLowerCase().includes(searchLower);

          const dimmed =
            (hoveredNodeId !== null && !connectedToHovered.has(n.id)) ||
            (searchLower !== "" && !matchesSearch);

          const highlighted =
            (hoveredNodeId !== null && connectedToHovered.has(n.id)) ||
            (searchLower !== "" && matchesSearch);

          return {
            id: n.id,
            type: "custom",
            data: {
              label: n.label,
              type: n.type,
              description: n.description || "",
              importance: n.importance ?? 0.5,
              dimmed,
              highlighted,
            } satisfies GraphNodeData,
            position: { x: 0, y: 0 },
          };
        }),
    [graphNodes, visibleNodeIds, hoveredNodeId, connectedToHovered, searchLower]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges
        .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
        .map((e, i) => {
          const weight = e.weight ?? 0.5;
          const isHoverConnected =
            hoveredNodeId !== null &&
            (e.source === hoveredNodeId || e.target === hoveredNodeId);

          const dashStyle = edgeStyleForRelationship(e.relationship);

          return {
            id: `e-${i}`,
            source: e.source,
            target: e.target,
            label: showLabels ? e.relationship : undefined,
            animated: isHoverConnected,
            style: {
              stroke: isHoverConnected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
              strokeWidth: 1 + weight * 2.5,
              ...dashStyle,
              transition: "stroke 0.2s, stroke-width 0.2s",
            },
            labelStyle: {
              fill: isHoverConnected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
              fontSize: 11,
              fontWeight: 500,
            },
            labelBgStyle: {
              fill: "rgba(11,13,18,0.85)",
              fillOpacity: 1,
            },
            labelBgPadding: [6, 4] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: isHoverConnected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
            },
          };
        }),
    [graphEdges, visibleNodeIds, hoveredNodeId, showLabels]
  );

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges, fitView]);

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    },
    [selectedNodeId, setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleResetLayout = useCallback(() => {
    const { nodes: fresh, edges: freshEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(fresh);
    setEdges(freshEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  const handleExportPng = useCallback(() => {
    const el = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!el) return;
    import("html-to-image").then(({ toPng }) => {
      toPng(el, { backgroundColor: "#0B0D12" }).then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "knowledge-graph.png";
        a.click();
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const selectedNode = useMemo(
    () => graphNodes.find((n) => n.id === selectedNodeId) || null,
    [graphNodes, selectedNodeId]
  );

  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const target = getNodes().find((n) => n.id === nodeId);
      if (target) {
        fitView({ nodes: [target], padding: 0.5, duration: 400 });
      }
    },
    [setSelectedNodeId, getNodes, fitView]
  );

  return (
    <div className="w-full h-full flex flex-col relative" style={{ minHeight: 400 }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02] shrink-0 z-10">
        <div className="flex items-center gap-1.5 mr-3">
          <GitBranch className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/40 font-medium">
            {graphNodes.length} nodes &middot; {graphEdges.length} edges
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            ref={searchInputRef}
            type="text"
            value={graphSearchQuery}
            onChange={(e) => setGraphSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
          />
          {graphSearchQuery && (
            <button
              onClick={() => setGraphSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-1 ml-2 flex-wrap">
          {activeTypes.map((type) => {
            const colors = TYPE_COLORS[type] || TYPE_COLORS.keyword;
            const active = graphTypeFilters.size === 0 || graphTypeFilters.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleGraphTypeFilter(type)}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-all"
                style={{
                  background: active ? colors.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active ? colors.border : "rgba(255,255,255,0.06)"}`,
                  color: active ? colors.text : "rgba(255,255,255,0.25)",
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Action buttons */}
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          title="Fit view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          title="Reset layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${showLabels ? "text-white/70" : "text-white/30"}`}
          title="Toggle edge labels"
        >
          <Type className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleExportPng}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          title="Export as PNG"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
          minZoom={0.2}
          maxZoom={2}
        >
          <Background color="rgba(255,255,255,0.03)" gap={20} />
          <Controls
            showInteractive={false}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          />
          <MiniMap
            style={{
              background: "rgba(11,13,18,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            maskColor="rgba(255,255,255,0.05)"
            nodeColor={(node) => {
              const d = node.data as unknown as GraphNodeData;
              const c = TYPE_COLORS[d?.type] || TYPE_COLORS.keyword;
              return c.text;
            }}
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#0d1017]/90 backdrop-blur-sm rounded-xl border border-white/10 p-3 z-10">
          <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Legend</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {activeTypes.map((type) => {
              const colors = TYPE_COLORS[type] || TYPE_COLORS.keyword;
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: colors.text }}
                  />
                  <span className="text-[11px] text-white/50 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-white/30" />
              <span className="text-[10px] text-white/35">contains / part of</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-white/30" style={{ strokeDasharray: "4 4", borderTop: "1px dashed rgba(255,255,255,0.3)" }} />
              <span className="text-[10px] text-white/35">references</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-px" style={{ borderTop: "1px dashed rgba(255,255,255,0.3)", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 8px, transparent 8px, transparent 12px)" }} />
              <span className="text-[10px] text-white/35">relates to</span>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <GraphDetailPanel
              node={selectedNode}
              edges={graphEdges}
              allNodes={graphNodes}
              onClose={() => setSelectedNodeId(null)}
              onNavigate={handleNavigateToNode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface GraphExplorerProps {
  nodes: GNode[];
  edges: GEdge[];
}

export default function GraphExplorer({ nodes, edges }: GraphExplorerProps) {
  return (
    <ReactFlowProvider>
      <GraphExplorerInner nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
}
