"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

export default function BottomCta({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionWrapper className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative">
          <div className="cta-glow" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              transform
            </span>{" "}
            your documents?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-white/40 text-lg mb-10 max-w-lg mx-auto"
          >
            Upload a PDF and get an AI-native .adf file in seconds.
          </motion.p>

          {children}

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-12 inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
            Back to top
          </motion.button>
        </div>
      </div>
    </SectionWrapper>
  );
}
