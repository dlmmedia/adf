"use client";

import { motion } from "framer-motion";
import { ChevronRight, FileText } from "lucide-react";
import type { Section } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SemanticViewerProps {
  sections: Section[];
  onSectionClick?: (section: Section) => void;
}

export default function SemanticViewer({ sections, onSectionClick }: SemanticViewerProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-white/40" />
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Document Structure
        </h2>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={`${section.title}-${i}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <button
            onClick={() => {
              setExpandedIdx(expandedIdx === i ? null : i);
              onSectionClick?.(section);
            }}
            className={cn(
              "w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg transition-colors hover:bg-white/[0.06]",
              expandedIdx === i && "bg-white/[0.04]"
            )}
            style={{ paddingLeft: `${section.level * 12 + 8}px` }}
          >
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 text-white/30 transition-transform shrink-0",
                expandedIdx === i && "rotate-90"
              )}
            />
            <span className={cn(
              "text-sm truncate",
              section.level === 1 ? "font-semibold text-white/90" : "text-white/60"
            )}>
              {section.title}
            </span>
            <span className="ml-auto text-xs text-white/20 shrink-0">
              p.{section.page}
            </span>
          </button>

          {expandedIdx === i && section.summary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-8 mr-2 mb-2 p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <p className="text-xs text-white/50 leading-relaxed">
                {section.summary}
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
