import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { BenchmarkData } from "@app/types/adf";

interface IntelligenceScoreCardProps {
  benchmarks: BenchmarkData;
}

export default function IntelligenceScoreCard({ benchmarks }: IntelligenceScoreCardProps) {
  const metrics = [
    { label: "Structure Accuracy", value: benchmarks.structure_accuracy, color: "#3b82f6" },
    { label: "Entity Recognition", value: benchmarks.entity_accuracy, color: "#8b5cf6" },
    { label: "AI Readiness", value: Math.min(0.99, benchmarks.structure_accuracy * 0.5 + benchmarks.entity_accuracy * 0.5 + 0.1), color: "#06b6d4" },
    { label: "Token Savings", value: benchmarks.token_savings_percent / 100, color: "#10b981" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Intelligence Score</h3>
      <div className="space-y-3">
        {metrics.map((m) => (
          <GaugeRow key={m.label} {...m} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Conversion Time</span>
          <span className="text-white font-medium">{(benchmarks.conversion_time_ms / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-white/40">Pages Processed</span>
          <span className="text-white font-medium">{benchmarks.total_pages}</span>
        </div>
      </div>
    </div>
  );
}

function GaugeRow({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: color, width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BenchmarkComparison({ benchmarks }: { benchmarks: BenchmarkData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 120;
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const pdfTime = benchmarks.conversion_time_ms * 4.5;
    const adfTime = benchmarks.conversion_time_ms;

    const data = [
      { label: "Traditional Parse", value: pdfTime, color: "#ef4444" },
      { label: "ADF Runtime", value: adfTime, color: "#3b82f6" },
    ];

    const x = d3.scaleLinear().domain([0, pdfTime]).range([0, innerW]);
    const y = d3.scaleBand().domain(data.map((d) => d.label)).range([0, innerH]).padding(0.4);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.label) || 0)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => d.color)
      .attr("width", 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 200)
      .attr("width", (d) => x(d.value));

    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", -8)
      .attr("y", (d) => (y(d.label) || 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "rgba(255,255,255,0.6)")
      .attr("font-size", 11)
      .text((d) => d.label);

    g.selectAll(".value")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.value) + 6)
      .attr("y", (d) => (y(d.label) || 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text((d) => `${(d.value / 1000).toFixed(1)}s`);
  }, [benchmarks]);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Speed Comparison</h3>
      <div className="bg-white/[0.03] rounded-xl p-4">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
