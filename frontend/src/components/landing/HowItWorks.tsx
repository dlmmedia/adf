"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Upload,
  FileSearch,
  LayoutList,
  Sparkles,
  Binary,
  PackageCheck,
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Drop any PDF",
    color: "text-white",
    glow: "shadow-white/10",
  },
  {
    icon: FileSearch,
    title: "Extract",
    desc: "Text & layout parsing",
    color: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  {
    icon: LayoutList,
    title: "Structure",
    desc: "Sections & headings",
    color: "text-indigo-400",
    glow: "shadow-indigo-500/20",
  },
  {
    icon: Sparkles,
    title: "Enrich",
    desc: "AI semantic analysis",
    color: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  {
    icon: Binary,
    title: "Embed",
    desc: "Vector embeddings",
    color: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: PackageCheck,
    title: "Package",
    desc: "Bundle into .adf",
    color: "text-green-400",
    glow: "shadow-green-500/20",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            How it{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            A six-stage pipeline transforms your document in seconds.
          </p>
        </div>

        <div ref={ref} className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-white/5 via-white/20 to-white/5"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Flowing particles along the line */}
          {isInView && (
            <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/60"
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{
                    left: ["0%", "100%"],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -4 }}
                  className={`w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 shadow-lg ${step.glow} group-hover:border-white/20 transition-colors`}
                >
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </motion.div>
                <h3 className="text-sm font-semibold mb-0.5">{step.title}</h3>
                <p className="text-xs text-white/35">{step.desc}</p>

                {/* Step number */}
                <motion.span
                  className="mt-2 text-[10px] font-mono text-white/15"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: i * 0.15 + 0.6 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
