"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  {
    value: 78,
    suffix: "%",
    label: "Faster Processing",
    description: "Compared to raw PDF re-parsing by each agent",
    color: "from-blue-500 to-blue-600",
    barColor: "bg-blue-500",
  },
  {
    value: 96,
    suffix: "%",
    label: "Structure Accuracy",
    description: "Headings, sections, and tables correctly identified",
    color: "from-green-500 to-green-600",
    barColor: "bg-green-500",
  },
  {
    value: 80,
    suffix: "%",
    label: "Token Savings",
    description: "Pre-computed semantics eliminate redundant LLM calls",
    color: "from-purple-500 to-purple-600",
    barColor: "bg-purple-500",
  },
  {
    value: 5,
    suffix: "",
    label: "Intelligence Layers",
    description: "PDF, semantic, agent, graph, and embeddings in one file",
    color: "from-cyan-500 to-cyan-600",
    barColor: "bg-cyan-500",
  },
];

const comparisonBars = [
  {
    label: "Parse time",
    traditional: 85,
    adf: 18,
    unit: "ms",
    traditionalVal: "~850",
    adfVal: "~180",
  },
  {
    label: "Accuracy",
    traditional: 62,
    adf: 96,
    unit: "%",
    traditionalVal: "62%",
    adfVal: "96%",
  },
  {
    label: "Token usage",
    traditional: 90,
    adf: 20,
    unit: "k",
    traditionalVal: "~90k",
    adfVal: "~20k",
  },
  {
    label: "Agent readiness",
    traditional: 15,
    adf: 95,
    unit: "%",
    traditionalVal: "15%",
    adfVal: "95%",
  },
];

export default function StatsSection() {
  const barRef = useRef<HTMLDivElement>(null);
  const barInView = useInView(barRef, { once: true, margin: "-60px" });

  return (
    <SectionWrapper id="stats" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              numbers
            </span>{" "}
            speak
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Measurable improvements over traditional PDF processing.
          </p>
        </div>

        {/* Stat cards with gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <svg viewBox="0 0 120 120" className="w-20 h-20">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{
                        strokeDashoffset: 2 * Math.PI * 50,
                      }}
                      whileInView={{
                        strokeDashoffset:
                          2 * Math.PI * 50 * (1 - stat.value / 100),
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.15 }}
                      transform="rotate(-90 60 60)"
                    />
                    <defs>
                      <linearGradient
                        id="grad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgb(59,130,246)"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgb(168,85,247)"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="text-xs font-semibold text-white/60 mt-1">
                    {stat.label}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1 hidden md:block">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison chart */}
        <div ref={barRef} className="max-w-2xl mx-auto">
          <h3 className="text-center text-lg font-semibold mb-8">
            Traditional PDF Parsing{" "}
            <span className="text-white/30">vs</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ADF
            </span>
          </h3>
          <div className="space-y-6">
            {comparisonBars.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">{bar.label}</span>
                  <div className="flex gap-4">
                    <span className="text-white/25">{bar.traditionalVal}</span>
                    <span className="text-blue-400 font-semibold">
                      {bar.adfVal}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-white/10"
                      initial={{ width: 0 }}
                      animate={
                        barInView
                          ? { width: `${bar.traditional}%` }
                          : { width: 0 }
                      }
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={
                        barInView
                          ? { width: `${bar.adf}%` }
                          : { width: 0 }
                      }
                      transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-white/10" />
              <span className="text-white/30">Traditional</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="text-white/50">ADF</span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
