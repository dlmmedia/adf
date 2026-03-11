import { Icon } from "@iconify/react";
import { TYPE_COLORS } from "@app/components/adf/GraphNodeCard";
import type { GraphNode, GraphEdge } from "@app/types/adf";

interface GraphDetailPanelProps {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
}

export default function GraphDetailPanel({
  node,
  edges,
  allNodes,
  onClose,
  onNavigate,
}: GraphDetailPanelProps) {
  const colors = TYPE_COLORS[node.type] || TYPE_COLORS.keyword;

  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0d1017]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {node.type}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <Icon icon="material-symbols:close" className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white/90 mb-2">{node.label}</h3>

        {node.description && (
          <p className="text-sm text-white/60 leading-relaxed mb-5">{node.description}</p>
        )}

        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40 uppercase tracking-wider font-medium">Importance</span>
            <span className="text-white/70 font-semibold">{Math.round((node.importance ?? 0.5) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-600"
              style={{ backgroundColor: colors.text, width: `${(node.importance ?? 0.5) * 100}%` }}
            />
          </div>
        </div>

        {connectedEdges.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Connections ({connectedEdges.length})
            </h4>
            <div className="space-y-2">
              {connectedEdges.map((edge, i) => {
                const isSource = edge.source === node.id;
                const otherId = isSource ? edge.target : edge.source;
                const otherNode = nodeMap.get(otherId);
                if (!otherNode) return null;
                const otherColors = TYPE_COLORS[otherNode.type] || TYPE_COLORS.keyword;

                return (
                  <button
                    key={i}
                    onClick={() => onNavigate(otherId)}
                    className="w-full text-left p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: otherColors.text }}
                      />
                      <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                        {otherNode.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/35 ml-4">
                      {isSource ? `${edge.relationship} →` : `← ${edge.relationship}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
