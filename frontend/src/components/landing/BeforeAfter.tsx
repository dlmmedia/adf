"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const rawPdfText = `Page 1 of 12
RESEARCH ARTICLE
Impact of Large Language Models on
Software Engineering Practices: A
Systematic Review
Authors: J. Chen, M. Patel, A. Rodriguez
Abstract
This paper presents a systematic review of...
large language models (LLMs) have...
increasingly been adopted in software eng-
ineering workflows. We analyze 147 papers
published between 2022-2025 and identify
key trends in code generation, testing, and
documentation. Our findings suggest...

Keywords: LLM, software engineering, code
generation, AI-assisted development

1 Introduction
The rapid advancement of artificial intelli-
gence (AI) has led to significant changes in
how software is developed, tested, and...`;

const adfLines: { text: string; type: "key" | "string" | "number" | "bracket" }[] = [
  { text: '{', type: "bracket" },
  { text: '  "doc_type": "research_article",', type: "key" },
  { text: '  "confidence": 0.94,', type: "number" },
  { text: '  "summary": "Systematic review analyzing', type: "key" },
  { text: '    147 papers on LLM adoption in SE,', type: "string" },
  { text: '    covering code gen, testing & docs.",', type: "string" },
  { text: '  "sections": [', type: "key" },
  { text: '    {', type: "bracket" },
  { text: '      "title": "Abstract",', type: "key" },
  { text: '      "level": 1,', type: "number" },
  { text: '      "page": 1,', type: "number" },
  { text: '      "summary": "Reviews LLM impact..."', type: "string" },
  { text: '    },', type: "bracket" },
  { text: '    {', type: "bracket" },
  { text: '      "title": "Introduction",', type: "key" },
  { text: '      "level": 1,', type: "number" },
  { text: '      "summary": "AI advancement context"', type: "string" },
  { text: '    }', type: "bracket" },
  { text: '  ],', type: "bracket" },
  { text: '  "entities": [', type: "key" },
  { text: '    { "type": "topic", "name": "LLM", "mentions": 47 },', type: "key" },
  { text: '    { "type": "person", "name": "J. Chen" },', type: "key" },
  { text: '    { "type": "metric", "name": "147 papers" }', type: "key" },
  { text: '  ],', type: "bracket" },
  { text: '  "graph": {', type: "key" },
  { text: '    "nodes": 23,', type: "number" },
  { text: '    "edges": 41,', type: "number" },
  { text: '    "relationships": ["authored_by",', type: "key" },
  { text: '      "cites", "relates_to", "measures"]', type: "string" },
  { text: '  }', type: "bracket" },
  { text: '}', type: "bracket" },
];

const lineColors = {
  key: "text-blue-400",
  string: "text-emerald-400/80",
  number: "text-amber-400/90",
  bracket: "text-white/40",
};

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      dragging.current = true;

      const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientX);
      const onTouchMove = (ev: TouchEvent) => handleMove(ev.touches[0].clientX);
      const onEnd = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchend", onEnd);
    },
    [handleMove]
  );

  return (
    <SectionWrapper id="before-after" className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            From{" "}
            <span className="text-white/30">raw text</span> to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              structured intelligence
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Drag the slider to compare raw PDF extraction with ADF output.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div
            ref={containerRef}
            className="relative rounded-2xl border border-white/10 overflow-hidden select-none"
            style={{ height: 480 }}
            onMouseDown={(e) => {
              handleMove(e.clientX);
              startDrag(e);
            }}
            onTouchStart={(e) => {
              handleMove(e.touches[0].clientX);
              startDrag(e);
            }}
          >
            {/* Left: Raw PDF */}
            <div
              className="absolute inset-0 bg-[#0d0f14] p-6 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <span className="text-xs font-mono text-white/40">
                  raw-document.pdf
                </span>
              </div>
              <pre className="text-[13px] font-mono text-white/30 leading-[1.7] whitespace-pre-wrap">
                {rawPdfText}
              </pre>
            </div>

            {/* Right: ADF output */}
            <div
              className="absolute inset-0 bg-[#080c16] p-6 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-mono text-emerald-400/60">
                  output.adf &rarr; agent.json
                </span>
              </div>
              <pre className="text-[13px] font-mono leading-[1.7] whitespace-pre-wrap">
                {adfLines.map((line, i) => (
                  <span key={i} className={lineColors[line.type]}>
                    {line.text}
                    {"\n"}
                  </span>
                ))}
              </pre>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 z-20 cursor-col-resize"
              style={{
                left: `${sliderPos}%`,
                transform: "translateX(-50%)",
                width: 32,
              }}
              onMouseDown={startDrag}
              onTouchStart={startDrag}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(139,92,246,0.5) 20%, rgba(59,130,246,0.5) 80%, transparent)",
                }}
              />
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white/[0.07] border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/30">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-white/60"
                >
                  <path
                    d="M4 3L1 7L4 11M10 3L13 7L10 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
              <span className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
                Raw PDF
              </span>
            </div>
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
              <span className="text-[10px] uppercase tracking-widest text-blue-400/50 font-medium">
                ADF Output
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
