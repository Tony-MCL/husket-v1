// ===============================
// src/state/uiStore.ts
// Global UI-state (small, per contract)
// ===============================
import { create } from "zustand";
import type { AlbumFilters, LifeId, PanelId } from "../domain/types";
import {
  loadActiveLifeId,
  loadPanelHintCount,
  saveActiveLifeId,
  savePanelHintCount
} from "../data/local";

type ViewerState = { isOpen: false } | { isOpen: true; husketId: string };

type UiState = {
  // global ui
  activeLifeId: LifeId | null;
  panel: PanelId;
  viewer: ViewerState;
  settingsOpen: boolean;
  albumFilters: AlbumFilters;

  // global admin overlays (still "global", not tied to life)
  trashOpen: boolean;

  // onboarding
  panelHintCount: number;

  // actions
  setActiveLifeId: (lifeId: LifeId) => void;
  goToPanel: (panel: PanelId) => void;

  openViewer: (husketId: string) => void;
  closeViewer: () => void;

  openSettings: () => void;
  closeSettings: () => void;

  openTrash: () => void;
  closeTrash: () => void;

  setAlbumFilters: (patch: Partial<AlbumFilters>) => void;
  clearAlbumFilters: () => void;

  bumpPanelHint: () => void;
};

const EMPTY_FILTERS: AlbumFilters = {};

export const useUiStore = create<UiState>((set, get) => ({
  activeLifeId: loadActiveLifeId(),
  panel: "album",
  viewer: { isOpen: false },
  settingsOpen: false,
  albumFilters: { ...EMPTY_FILTERS },

  trashOpen: false,

  panelHintCount: loadPanelHintCount(),

  setActiveLifeId: (lifeId) => {
    saveActiveLifeId(lifeId);
    set({ activeLifeId: lifeId });
  },

  goToPanel: (panel) => set({ panel }),

  openViewer: (husketId) => set({ viewer: { isOpen: true, husketId } }),
  closeViewer: () => set({ viewer: { isOpen: false } }),

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  openTrash: () => set({ trashOpen: true }),
  closeTrash: () => set({ trashOpen: false }),

  setAlbumFilters: (patch) => set({ albumFilters: { ...get().albumFilters, ...patch } }),
  clearAlbumFilters: () => set({ albumFilters: { ...EMPTY_FILTERS } }),

  bumpPanelHint: () => {
    const next = Math.min(10, get().panelHintCount + 1);
    savePanelHintCount(next);
    set({ panelHintCount: next });
  }
}));
