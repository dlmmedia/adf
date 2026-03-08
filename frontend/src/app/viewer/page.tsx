"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  GitBranch,
  Brain,
  ArrowLeft,
  FileArchive,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import PdfViewer from "@/components/PdfViewer";
import SemanticViewer from "@/components/SemanticViewer";
import AgentPanel from "@/components/AgentPanel";
import GraphExplorer from "@/components/GraphExplorer";
import { type DocumentData, type Section } from "@/lib/api";
import { loadAdfFile, revokeAdfBlobUrl, type AdfLoadResult } from "@/lib/adf-loader";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ViewerPage() {
  const [result, setResult] = useState<AdfLoadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    return () => {
      if (result) revokeAdfBlobUrl(result.pdfBlobUrl);
    };
  }, [result]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".adf")) {
      setError("Please select a valid .adf file");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadAdfFile(file);
      setResult(loaded);
    } catch (err: any) {
      setError(err.message || "Failed to open ADF file");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSectionClick = useCallback((section: Section) => {
    if (section.page > 0) {
      setTargetPage(section.page);
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ADF</span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                <FileArchive className="w-3.5 h-3.5" />
                ADF Viewer
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                Open an ADF file
              </h1>
              <p className="text-white/50">
                View any downloaded .adf file with full intelligence dashboard
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
                isDragging
                  ? "border-purple-500/60 bg-purple-500/5"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".adf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  <p className="text-white/50">Loading ADF file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white/80 font-medium mb-1">
                      Drop your .adf file here
                    </p>
                    <p className="text-sm text-white/40">
                      or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  const doc = result.document;

  return (
    <div className="h-screen flex flex-col bg-[#0B0D12]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              revokeAdfBlobUrl(result.pdfBlobUrl);
              setResult(null);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10" />
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm font-medium text-white/70 truncate max-w-xs">
            {result.fileName} — {doc.agent.doc_type.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            Local ADF
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

          <button
            onClick={toggleAgentPanel}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
          >
            {agentPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
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

        <div className="flex-1 overflow-hidden">
          {activeTab === "viewer" ? (
            <>
              {viewMode === "visual" && (
                <PdfViewer pdfUrl={result.pdfBlobUrl} goToPage={targetPage} />
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
                            section.level === 1
                              ? "text-2xl"
                              : section.level === 2
                                ? "text-xl"
                                : "text-lg"
                          )}
                        >
                          {section.title}
                        </h2>
                        {section.summary && (
                          <div className="mb-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <p className="text-sm text-blue-300/80">
                              {section.summary}
                            </p>
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
                    <PdfViewer pdfUrl={result.pdfBlobUrl} goToPage={targetPage} />
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
                            <p className="text-xs text-white/40">
                              {section.summary}
                            </p>
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
