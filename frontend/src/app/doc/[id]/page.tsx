"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Download,
  Eye,
  GitBranch,
  Brain,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import PdfViewer from "@/components/PdfViewer";
import SemanticViewer from "@/components/SemanticViewer";
import AgentPanel from "@/components/AgentPanel";
import GraphExplorer from "@/components/GraphExplorer";
import { fetchDocument, getPdfUrl, getDownloadUrl, type DocumentData, type Section } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DocumentPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number | null>(null);

  const {
    sidebarOpen,
    agentPanelOpen,
    toggleSidebar,
    toggleAgentPanel,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
  } = useAppStore();

  useEffect(() => {
    let retries = 0;
    const maxRetries = 10;

    async function load() {
      try {
        const data = await fetchDocument(jobId);
        setDoc(data);
        setLoading(false);
      } catch (err: any) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(load, 1500);
        } else {
          setError("Failed to load document");
          setLoading(false);
        }
      }
    }

    load();
  }, [jobId]);

  const handleSectionClick = useCallback((section: Section) => {
    if (section.page > 0) {
      setTargetPage(section.page);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="text-white/50">Loading document intelligence...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Document not found"}</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0B0D12]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors">
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <span className="text-sm font-medium text-white/70 truncate max-w-xs">
            {doc.agent.doc_type.replace(/_/g, " ")} — {doc.benchmarks.total_pages} pages
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/5 p-0.5">
            <TabButton
              active={activeTab === "viewer"}
              onClick={() => setActiveTab("viewer")}
              icon={<Eye className="w-3.5 h-3.5" />}
              label="Viewer"
            />
            <TabButton
              active={activeTab === "graph"}
              onClick={() => setActiveTab("graph")}
              icon={<GitBranch className="w-3.5 h-3.5" />}
              label="Graph"
            />
          </div>

          {activeTab === "viewer" && (
            <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/5 p-0.5 ml-2">
              <TabButton
                active={viewMode === "visual"}
                onClick={() => setViewMode("visual")}
                label="PDF"
              />
              <TabButton
                active={viewMode === "semantic"}
                onClick={() => setViewMode("semantic")}
                label="Semantic"
              />
              <TabButton
                active={viewMode === "hybrid"}
                onClick={() => setViewMode("hybrid")}
                label="Hybrid"
              />
            </div>
          )}

          <div className="w-px h-5 bg-white/10 mx-1" />

          <a
            href={getDownloadUrl(jobId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            .adf
          </a>

          <button onClick={toggleAgentPanel} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors">
            {agentPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-white/5 overflow-hidden shrink-0"
            >
              <SemanticViewer
                sections={doc.semantic.sections}
                onSectionClick={handleSectionClick}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "viewer" ? (
            <>
              {viewMode === "visual" && (
                <PdfViewer pdfUrl={getPdfUrl(jobId)} goToPage={targetPage} />
              )}
              {viewMode === "semantic" && (
                <div className="h-full overflow-y-auto p-8">
                  <div className="max-w-3xl mx-auto space-y-8">
                    {doc.semantic.sections.map((section, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <h2
                          className={cn(
                            "font-semibold mb-2",
                            section.level === 1 ? "text-2xl" : section.level === 2 ? "text-xl" : "text-lg"
                          )}
                        >
                          {section.title}
                        </h2>
                        {section.summary && (
                          <div className="mb-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <p className="text-sm text-blue-300/80">{section.summary}</p>
                          </div>
                        )}
                        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {viewMode === "hybrid" && (
                <div className="h-full flex">
                  <div className="flex-1">
                    <PdfViewer pdfUrl={getPdfUrl(jobId)} goToPage={targetPage} />
                  </div>
                  <div className="w-80 border-l border-white/5 overflow-y-auto p-6">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                      Semantic Overlay
                    </h3>
                    <div className="space-y-4">
                      {doc.semantic.sections.map((section, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/5"
                        >
                          <h4 className="text-sm font-medium text-white/80 mb-1">
                            {section.title}
                          </h4>
                          {section.summary && (
                            <p className="text-xs text-white/40">{section.summary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <GraphExplorer nodes={doc.graph.nodes} edges={doc.graph.edges} />
          )}
        </div>

        {/* Right panel */}
        <AnimatePresence>
          {agentPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-white/5 overflow-hidden shrink-0"
            >
              <AgentPanel document={doc} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-white/40 hover:text-white/60"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
