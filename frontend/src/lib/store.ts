import { create } from "zustand";
import type { ConversionStatus, DocumentData } from "./api";
import type { AuthUser } from "./auth";

interface AppState {
  user: AuthUser | null;
  jobId: string | null;
  conversionStatus: ConversionStatus | null;
  document: DocumentData | null;
  viewMode: "visual" | "semantic" | "hybrid";
  sidebarOpen: boolean;
  agentPanelOpen: boolean;

  setUser: (user: AuthUser | null) => void;
  setJobId: (id: string) => void;
  setConversionStatus: (status: ConversionStatus) => void;
  setDocument: (doc: DocumentData) => void;
  setViewMode: (mode: "visual" | "semantic" | "hybrid") => void;
  toggleSidebar: () => void;
  toggleAgentPanel: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  jobId: null,
  conversionStatus: null,
  document: null,
  viewMode: "hybrid",
  sidebarOpen: true,
  agentPanelOpen: true,

  setUser: (user) => set({ user }),
  setJobId: (id) => set({ jobId: id }),
  setConversionStatus: (status) => set({ conversionStatus: status }),
  setDocument: (doc) => set({ document: doc }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAgentPanel: () => set((s) => ({ agentPanelOpen: !s.agentPanelOpen })),
  reset: () =>
    set({
      jobId: null,
      conversionStatus: null,
      document: null,
      viewMode: "hybrid",
    }),
}));
