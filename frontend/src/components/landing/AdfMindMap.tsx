"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

interface MindMapNode {
  id: string;
  label: string;
  description: string;
  preview: string[];
  color: string;
  angle: number;
}

const nodes: MindMapNode[] = [
  {
    id: "pdf",
    label: "document.pdf",
    description: "Original PDF preserved byte-for-byte",
    preview: ["Full text content", "Layout & formatting", "Images & tables"],
    color: "#ef4444",
    angle: -72,
  },
  {
    id: "semantic",
    label: "semantic.json",
    description: "Structured document hierarchy",
    preview: [
      '{ "sections": [...]',
      '  "tables": [...]',
      '  "references": [...] }',
    ],
    color: "#3b82f6",
    angle: -36,
  },
  {
    id: "agent",
    label: "agent.json",
    description: "AI-generated intelligence layer",
    preview: [
      '{ "doc_type": "research"',
      '  "entities": [...]',
      '  "summary": "..." }',
    ],
    color: "#a855f7",
    angle: 0,
  },
  {
    id: "graph",
    label: "graph.json",
    description: "Entity relationship knowledge graph",
    preview: [
      '{ "nodes": [...]',
      '  "edges": [...]',
      '  "relationships": [...] }',
    ],
    color: "#06b6d4",
    angle: 36,
  },
  {
    id: "embeddings",
    label: "embeddings.bin",
    description: "Vector embeddings for semantic search",
    preview: [
      "1536-dim vectors",
      "Per-chunk embeddings",
      "Cosine-similarity ready",
    ],
    color: "#22c55e",
    angle: 72,
  },
];

export default function AdfMindMap() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const radius = 180;

  return (
    <SectionWrapper id="mind-map" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Anatomy of an{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              .adf file
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Five intelligence layers packed into a single portable archive.
            Hover to explore each layer.
          </p>
        </div>

        <div ref={ref} className="relative flex justify-center">
          <div className="relative w-[500px] h-[420px] hidden md:block">
            {/* Center node */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center adf-pulse">
                <span className="text-sm font-bold font-mono text-white/80">
                  .adf
                </span>
              </div>
            </motion.div>

            {/* Branch nodes */}
            {nodes.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const y = -Math.cos(rad) * radius * 0.9;
              const isActive = activeNode === node.id;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    isInView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0 }
                  }
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                  className="absolute left-1/2 top-1/2 z-10"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: `${Math.abs(x) + 20}px`,
                      height: `${Math.abs(y) + 20}px`,
                      transform: `translate(${x > 0 ? "-100%" : "0"}, ${y > 0 ? "-100%" : "0"})`,
                      overflow: "visible",
                    }}
                  >
                    <motion.line
                      x1={x > 0 ? "100%" : "0"}
                      y1={y > 0 ? "100%" : "0"}
                      x2={x > 0 ? "0" : "100%"}
                      y2={y > 0 ? "0" : "100%"}
                      stroke={isActive ? node.color : "rgba(255,255,255,0.08)"}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={isActive ? "none" : "4 4"}
                    />
                  </svg>

                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`relative px-4 py-2.5 rounded-xl border backdrop-blur-sm cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? "bg-white/[0.08] border-white/20"
                        : "bg-white/[0.03] border-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: node.color }}
                      />
                      <span className="text-xs font-mono font-semibold text-white/70">
                        {node.label}
                      </span>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 p-3 rounded-xl bg-[#151820] border border-white/10 shadow-xl z-30"
                      >
                        <p className="text-xs text-white/50 mb-2">
                          {node.description}
                        </p>
                        <div className="space-y-1">
                          {node.preview.map((line, li) => (
                            <p
                              key={li}
                              className="text-[10px] font-mono text-white/30"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile fallback - vertical list */}
          <div className="md:hidden space-y-3 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="inline-flex w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 items-center justify-center">
                <span className="text-xs font-bold font-mono text-white/80">
                  .adf
                </span>
              </div>
            </div>
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <div>
                  <p className="text-xs font-mono font-semibold text-white/70">
                    {node.label}
                  </p>
                  <p className="text-[10px] text-white/35">
                    {node.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
