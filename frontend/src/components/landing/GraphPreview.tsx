"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import * as d3 from "d3";
import SectionWrapper from "./SectionWrapper";

interface GNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  radius: number;
}

interface GLink extends d3.SimulationLinkDatum<GNode> {
  relationship: string;
}

const sampleNodes: GNode[] = [
  { id: "1", label: "Machine Learning", type: "concept", radius: 28 },
  { id: "2", label: "Neural Networks", type: "concept", radius: 24 },
  { id: "3", label: "Deep Learning", type: "concept", radius: 22 },
  { id: "4", label: "TensorFlow", type: "technology", radius: 20 },
  { id: "5", label: "PyTorch", type: "technology", radius: 20 },
  { id: "6", label: "CNN", type: "model", radius: 18 },
  { id: "7", label: "Transformer", type: "model", radius: 22 },
  { id: "8", label: "GPT", type: "model", radius: 20 },
  { id: "9", label: "NLP", type: "concept", radius: 22 },
  { id: "10", label: "Computer Vision", type: "concept", radius: 22 },
  { id: "11", label: "Attention", type: "concept", radius: 18 },
  { id: "12", label: "BERT", type: "model", radius: 18 },
];

const sampleLinks: GLink[] = [
  { source: "1", target: "2", relationship: "includes" },
  { source: "2", target: "3", relationship: "subset" },
  { source: "3", target: "4", relationship: "uses" },
  { source: "3", target: "5", relationship: "uses" },
  { source: "2", target: "6", relationship: "type" },
  { source: "2", target: "7", relationship: "type" },
  { source: "7", target: "8", relationship: "basis" },
  { source: "1", target: "9", relationship: "application" },
  { source: "1", target: "10", relationship: "application" },
  { source: "7", target: "11", relationship: "mechanism" },
  { source: "9", target: "12", relationship: "model" },
  { source: "10", target: "6", relationship: "uses" },
  { source: "7", target: "12", relationship: "basis" },
];

const typeColors: Record<string, string> = {
  concept: "#3b82f6",
  technology: "#22c55e",
  model: "#a855f7",
};

export default function GraphPreview() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const initialized = useRef(false);

  const initGraph = useCallback(() => {
    if (!svgRef.current || initialized.current) return;
    initialized.current = true;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    Object.entries(typeColors).forEach(([type, color]) => {
      const gradient = defs
        .append("radialGradient")
        .attr("id", `node-grad-${type}`);
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.3);
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.08);
    });

    const g = svg.append("g");

    const nodes = sampleNodes.map((d) => ({ ...d }));
    const links = sampleLinks.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GNode, GLink>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GNode>().radius((d) => d.radius + 8));

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-width", 1);

    const nodeGroup = g
      .append("g")
      .selectAll<SVGGElement, GNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "grab");

    nodeGroup
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => `url(#node-grad-${d.type})`)
      .attr("stroke", (d) => typeColors[d.type] || "#fff")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3);

    nodeGroup
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", (d) => Math.max(8, d.radius * 0.4))
      .attr("font-family", "system-ui, sans-serif")
      .attr("pointer-events", "none");

    const drag = d3
      .drag<SVGGElement, GNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag);

    nodeGroup
      .on("mouseenter", function (_, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.8)
          .attr("stroke-width", 2);

        link
          .attr("stroke", (l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return src === d.id || tgt === d.id
              ? typeColors[d.type]
              : "rgba(255,255,255,0.06)";
          })
          .attr("stroke-opacity", (l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return src === d.id || tgt === d.id ? 0.5 : 0.3;
          })
          .attr("stroke-width", (l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return src === d.id || tgt === d.id ? 2 : 1;
          });
      })
      .on("mouseleave", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.3)
          .attr("stroke-width", 1);

        link
          .attr("stroke", "rgba(255,255,255,0.06)")
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 1);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GNode).x!)
        .attr("y1", (d) => (d.source as GNode).y!)
        .attr("x2", (d) => (d.target as GNode).x!)
        .attr("y2", (d) => (d.target as GNode).y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  }, []);

  useEffect(() => {
    if (isInView) initGraph();
  }, [isInView, initGraph]);

  return (
    <SectionWrapper id="graph" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Built-in{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              knowledge graph
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Every ADF file contains an entity-relationship graph. Drag nodes to
            explore connections.
          </p>
        </div>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden"
          style={{ height: 420 }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ touchAction: "none" }}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-4">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-[10px] text-white/30 capitalize">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
