// ===============================
// src/state/uiStore.ts
// Global UI-state (small, per contract)
//
// v0.2.11:
// - When opening modal overlays from Settings, auto-close Settings first.
//   Prevents "modal under drawer" / click-blocking issues.
// ===============================
import { create } from "zustand";
import type { AlbumFilters, LifeId, PanelId } from "../domain/types";
import { loadActiveLifeId, loadPanelHintCount, saveActiveLifeId, savePanelHintCount } from "../data/local";

type ViewerState = { isOpen: false } | { isOpen: true; husketId: string };

type UiState = {
  activeLifeId: LifeId | null;
  panel: PanelId;
  viewer: ViewerState;
  settingsOpen: boolean;
  albumFilters: AlbumFilters;

  trashOpen: boolean;

  categoryConfigOpen: boolean;

  panelHintCount: number;

  setActiveLifeId: (lifeId: LifeId) => void;
  goToPanel: (panel: PanelId) => void;

  openViewer: (husketId: string) => void;
  closeViewer: () => void;

  openSettings: () => void;
  closeSettings: () => void;

  openTrash: () => void;
  closeTrash: () => void;

  openCategoryConfig: () => void;
  closeCategoryConfig: () => void;

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
  categoryConfigOpen: false,

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

  openTrash: () => {
    // Ensure drawer never blocks trash modal
    set({ settingsOpen: false, trashOpen: true });
  },
  closeTrash: () => set({ trashOpen: false }),

  openCategoryConfig: () => {
    // Ensure drawer never blocks category modal
    set({ settingsOpen: false, categoryConfigOpen: true });
  },
  closeCategoryConfig: () => set({ categoryConfigOpen: false }),

  setAlbumFilters: (patch) => set({ albumFilters: { ...get().albumFilters, ...patch } }),
  clearAlbumFilters: () => set({ albumFilters: { ...EMPTY_FILTERS } }),

  bumpPanelHint: () => {
    const next = Math.min(10, get().panelHintCount + 1);
    savePanelHintCount(next);
    set({ panelHintCount: next });
  }
}));
