import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { DocumentData, AdfViewMode } from "@app/types/adf";
import { loadAdfFile, revokeAdfBlobUrl, type AdfLoadResult } from "@app/utils/adf-loader";
import { convertPdfToAdf, type ConversionProgress } from "@app/services/adfConverter";

interface AdfState {
  isAdfLoaded: boolean;
  isConverting: boolean;
  conversionProgress: ConversionProgress | null;
  document: DocumentData | null;
  pdfBlobUrl: string | null;
  fileName: string | null;
  viewMode: AdfViewMode;
  selectedNodeId: string | null;
  graphSearchQuery: string;
  graphTypeFilters: Set<string>;
  activeTab: "viewer" | "graph";
}

interface AdfActions {
  loadAdf: (file: File) => Promise<void>;
  convertAndLoadPdf: (pdfFile: File) => Promise<void>;
  clearAdf: () => void;
  setViewMode: (mode: AdfViewMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setGraphSearchQuery: (query: string) => void;
  toggleGraphTypeFilter: (type: string) => void;
  setActiveTab: (tab: "viewer" | "graph") => void;
}

type AdfContextType = AdfState & AdfActions;

const AdfContext = createContext<AdfContextType | null>(null);

export function AdfProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdfState>({
    isAdfLoaded: false,
    isConverting: false,
    conversionProgress: null,
    document: null,
    pdfBlobUrl: null,
    fileName: null,
    viewMode: "pdf",
    selectedNodeId: null,
    graphSearchQuery: "",
    graphTypeFilters: new Set(),
    activeTab: "viewer",
  });

  const loadAdf = useCallback(async (file: File) => {
    if (state.pdfBlobUrl) {
      revokeAdfBlobUrl(state.pdfBlobUrl);
    }

    const result: AdfLoadResult = await loadAdfFile(file);
    setState({
      isAdfLoaded: true,
      isConverting: false,
      conversionProgress: null,
      document: result.document,
      pdfBlobUrl: result.pdfBlobUrl,
      fileName: result.fileName,
      viewMode: "pdf",
      selectedNodeId: null,
      graphSearchQuery: "",
      graphTypeFilters: new Set(),
      activeTab: "viewer",
    });
  }, [state.pdfBlobUrl]);

  const convertAndLoadPdf = useCallback(async (pdfFile: File) => {
    if (state.pdfBlobUrl) {
      revokeAdfBlobUrl(state.pdfBlobUrl);
    }

    setState((prev) => ({
      ...prev,
      isConverting: true,
      conversionProgress: null,
    }));

    try {
      const result = await convertPdfToAdf(pdfFile, (progress) => {
        setState((prev) => ({ ...prev, conversionProgress: progress }));
      });

      const adfFileName = pdfFile.name.replace(/\.pdf$/i, "") + ".adf";
      const adfFile = new File([result.adfBlob], adfFileName, {
        type: "application/zip",
      });
      const loadResult = await loadAdfFile(adfFile);

      setState({
        isAdfLoaded: true,
        isConverting: false,
        conversionProgress: null,
        document: loadResult.document,
        pdfBlobUrl: loadResult.pdfBlobUrl,
        fileName: loadResult.fileName,
        viewMode: "pdf",
        selectedNodeId: null,
        graphSearchQuery: "",
        graphTypeFilters: new Set(),
        activeTab: "viewer",
      });
    } catch (err) {
      console.error("[AdfContext] PDF to ADF conversion failed:", err);
      setState((prev) => ({
        ...prev,
        isConverting: false,
        conversionProgress: null,
      }));
    }
  }, [state.pdfBlobUrl]);

  const clearAdf = useCallback(() => {
    if (state.pdfBlobUrl) {
      revokeAdfBlobUrl(state.pdfBlobUrl);
    }
    setState({
      isAdfLoaded: false,
      isConverting: false,
      conversionProgress: null,
      document: null,
      pdfBlobUrl: null,
      fileName: null,
      viewMode: "pdf",
      selectedNodeId: null,
      graphSearchQuery: "",
      graphTypeFilters: new Set(),
      activeTab: "viewer",
    });
  }, [state.pdfBlobUrl]);

  const setViewMode = useCallback((mode: AdfViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSelectedNodeId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedNodeId: id }));
  }, []);

  const setGraphSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, graphSearchQuery: query }));
  }, []);

  const toggleGraphTypeFilter = useCallback((type: string) => {
    setState((prev) => {
      const next = new Set(prev.graphTypeFilters);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { ...prev, graphTypeFilters: next };
    });
  }, []);

  const setActiveTab = useCallback((tab: "viewer" | "graph") => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const value: AdfContextType = {
    ...state,
    loadAdf,
    convertAndLoadPdf,
    clearAdf,
    setViewMode,
    setSelectedNodeId,
    setGraphSearchQuery,
    toggleGraphTypeFilter,
    setActiveTab,
  };

  return <AdfContext.Provider value={value}>{children}</AdfContext.Provider>;
}

export function useAdf(): AdfContextType {
  const ctx = useContext(AdfContext);
  if (!ctx) {
    throw new Error("useAdf must be used within an AdfProvider");
  }
  return ctx;
}
