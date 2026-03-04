"use client";

import { motion } from "framer-motion";
import {
  Zap,
  FileText,
  Brain,
  Database,
  Network,
  Binary,
} from "lucide-react";

const floatingIcons = [
  { Icon: FileText, x: -320, y: -80, delay: 0, size: 20 },
  { Icon: Brain, x: 300, y: -100, delay: 0.4, size: 22 },
  { Icon: Database, x: -280, y: 60, delay: 0.8, size: 18 },
  { Icon: Network, x: 340, y: 80, delay: 1.2, size: 20 },
  { Icon: Binary, x: -160, y: -140, delay: 0.6, size: 16 },
  { Icon: Zap, x: 180, y: -130, delay: 1.0, size: 18 },
];

export default function HeroSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-20 overflow-hidden">
      <div className="hero-glow" />

      {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/[0.06] pointer-events-none hidden md:block"
          style={{ left: "50%", top: "40%" }}
          initial={{ opacity: 0, x, y }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            x: [x, x + 10, x - 10, x],
            y: [y, y - 15, y + 15, y],
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
        >
          <Zap className="w-3.5 h-3.5" />
          Agent Document Format
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-5">
          Turn documents into{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            intelligent objects
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
        >
          Convert any PDF into an AI-native knowledge object that agents
          instantly understand, trust, and act on.
        </motion.p>
      </motion.div>

      {children}
    </div>
  );
}
