"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Layers, Brain, Package } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const pillars = [
  {
    icon: Layers,
    title: "Structured",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description:
      "Every section, heading, table, and reference is detected and organized into a clean semantic hierarchy.",
  },
  {
    icon: Brain,
    title: "Intelligent",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    description:
      "AI enrichment adds summaries, entity extraction, classification, and a full knowledge graph.",
  },
  {
    icon: Package,
    title: "Portable",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    description:
      "A single .adf file bundles everything — PDF, semantics, intelligence, embeddings — ready for any agent.",
  },
];

const adfLayers = [
  {
    file: "document.pdf",
    desc: "Original PDF preserved",
    color: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
  },
  {
    file: "semantic.json",
    desc: "Sections, headings & tables",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
  },
  {
    file: "agent.json",
    desc: "Classification, entities & summaries",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
  },
  {
    file: "graph.json",
    desc: "Knowledge graph relationships",
    color: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
  },
  {
    file: "embeddings.bin",
    desc: "Vector embeddings per chunk",
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
  },
];

export default function WhatIsAdf() {
  const layerRef = useRef<HTMLDivElement>(null);
  const layerInView = useInView(layerRef, { once: true, margin: "-60px" });

  return (
    <SectionWrapper id="what-is-adf" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            What is{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ADF
            </span>
            ?
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Agent Document Format turns static PDFs into structured,
            AI-readable knowledge objects packed with intelligence layers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-2xl ${p.bg} border ${p.border} backdrop-blur-sm`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-4`}
              >
                <p.icon className={`w-6 h-6 ${p.color}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${p.color}`}>
                {p.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div ref={layerRef} className="relative max-w-xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-sm text-white/30 uppercase tracking-widest font-medium">
              Inside an .adf file
            </span>
          </div>
          <div className="relative space-y-3">
            {adfLayers.map((layer, i) => (
              <motion.div
                key={layer.file}
                initial={{ opacity: 0, x: -30, scaleX: 0.9 }}
                animate={
                  layerInView
                    ? { opacity: 1, x: 0, scaleX: 1 }
                    : { opacity: 0, x: -30, scaleX: 0.9 }
                }
                transition={{
                  delay: i * 0.12,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${layer.color} border ${layer.border} backdrop-blur-sm cursor-default`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-white/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-mono text-white/80">
                    {layer.file}
                  </p>
                  <p className="text-xs text-white/40">{layer.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
