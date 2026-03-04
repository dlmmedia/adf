"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Database, Search, BookOpen, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const useCases = [
  {
    icon: Bot,
    title: "AI Agents",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    short: "Give agents instant document understanding without re-parsing.",
    detail:
      "Agents receive pre-structured semantic data, entity graphs, and embeddings — no need to call an LLM just to understand the document. Reading order, section hierarchy, and confidence scores are built in.",
  },
  {
    icon: Database,
    title: "RAG Pipelines",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    short: "Pre-chunked, pre-embedded content ready for vector stores.",
    detail:
      "Skip the chunking and embedding pipeline entirely. ADF files include optimized text chunks with pre-computed vector embeddings, saving 80%+ of token costs in retrieval-augmented generation workflows.",
  },
  {
    icon: Search,
    title: "Document Intelligence",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    short: "Rich metadata extraction and classification at conversion time.",
    detail:
      "Document type classification, entity extraction, keyword tagging, and summary generation all happen once during conversion. Downstream systems query structured JSON instead of raw text.",
  },
  {
    icon: BookOpen,
    title: "Research Automation",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    short: "Map knowledge graphs across papers and reports automatically.",
    detail:
      "Each ADF contains a knowledge graph of entities and relationships. Combine graphs across multiple documents to discover cross-references, build literature maps, and automate systematic reviews.",
  },
];

export default function UseCases() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SectionWrapper id="use-cases" className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              real workflows
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            From autonomous agents to research pipelines, ADF fits naturally
            into the stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((uc, i) => {
            const isOpen = expanded === i;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setExpanded(isOpen ? null : i)}
                className={`p-6 rounded-2xl ${uc.bg} border ${uc.border} cursor-pointer transition-all duration-300 hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${uc.bg} flex items-center justify-center shrink-0`}
                  >
                    <uc.icon className={`w-5 h-5 ${uc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold">{uc.title}</h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-white/20" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {uc.short}
                    </p>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm text-white/30 leading-relaxed mt-3 overflow-hidden"
                        >
                          {uc.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
