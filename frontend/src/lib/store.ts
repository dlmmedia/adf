import { create } from "zustand";
import type { ConversionStatus, DocumentData } from "./api";
import type { AuthUser } from "./auth";

interface AppState {
  user: AuthUser | null;
  token: string | null;
  jobId: string | null;
  conversionStatus: ConversionStatus | null;
  document: DocumentData | null;
  viewMode: "visual" | "semantic" | "hybrid";
  sidebarOpen: boolean;
  agentPanelOpen: boolean;

  selectedNodeId: string | null;
  graphSearchQuery: string;
  graphTypeFilters: Set<string>;
  activeTab: "viewer" | "graph";

  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setJobId: (id: string) => void;
  setConversionStatus: (status: ConversionStatus) => void;
  setDocument: (doc: DocumentData) => void;
  setViewMode: (mode: "visual" | "semantic" | "hybrid") => void;
  toggleSidebar: () => void;
  toggleAgentPanel: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setGraphSearchQuery: (q: string) => void;
  toggleGraphTypeFilter: (type: string) => void;
  setActiveTab: (tab: "viewer" | "graph") => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  jobId: null,
  conversionStatus: null,
  document: null,
  viewMode: "hybrid",
  sidebarOpen: true,
  agentPanelOpen: true,

  selectedNodeId: null,
  graphSearchQuery: "",
  graphTypeFilters: new Set<string>(),
  activeTab: "viewer",

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setJobId: (id) => set({ jobId: id }),
  setConversionStatus: (status) => set({ conversionStatus: status }),
  setDocument: (doc) => set({ document: doc }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAgentPanel: () => set((s) => ({ agentPanelOpen: !s.agentPanelOpen })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setGraphSearchQuery: (q) => set({ graphSearchQuery: q }),
  toggleGraphTypeFilter: (type) =>
    set((s) => {
      const next = new Set(s.graphTypeFilters);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { graphTypeFilters: next };
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () =>
    set({
      jobId: null,
      conversionStatus: null,
      document: null,
      viewMode: "hybrid",
      sidebarOpen: true,
      agentPanelOpen: true,
      selectedNodeId: null,
      graphSearchQuery: "",
      graphTypeFilters: new Set<string>(),
      activeTab: "viewer",
    }),
}));
