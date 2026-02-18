// ===============================
// src/app/App.tsx
// - Viewer uses swipe deck
// - Fix: correct ViewerState (uses husketId, not id)
// - Global overlay lock: when any overlay/modal is open, make the rest of the app inert
//   to prevent click-through across layers on mobile/desktop.
// ===============================
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { SplashScreen } from "../screens/SplashScreen";
import { LifePickerScreen } from "../screens/LifePickerScreen";
import { AlbumScreen } from "../screens/AlbumScreen";
import { CaptureScreen } from "../screens/CaptureScreen";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { SettingsDrawer } from "../components/SettingsDrawer";
import { ToastHost } from "../components/ToastHost";
import { TrashScreen } from "../screens/TrashScreen";
import { ViewerDeckModal } from "../screens/ViewerDeckModal";
import { listByLife } from "../data/husketRepo";
import type { Husket } from "../domain/types";

type BootPhase = "splash" | "ready";

export function App() {
  const [boot, setBoot] = useState<BootPhase>("splash");
  const [toast, setToast] = useState<string | null>(null);

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const panel = useUiStore((s) => s.panel);
  const goToPanel = useUiStore((s) => s.goToPanel);

  const viewer = useUiStore((s) => s.viewer);
  const openViewer = useUiStore((s) => s.openViewer);
  const closeViewer = useUiStore((s) => s.closeViewer);

  const bumpHint = useUiStore((s) => s.bumpPanelHint);
  const hintCount = useUiStore((s) => s.panelHintCount);

  const albumFilters = useUiStore((s) => s.albumFilters);
  const setAlbumFilters = useUiStore((s) => s.setAlbumFilters);
  const clearAlbumFilters = useUiStore((s) => s.clearAlbumFilters);

  const trashOpen = useUiStore((s) => s.trashOpen);
  const closeTrash = useUiStore((s) => s.closeTrash);

  // SettingsDrawer: some builds keep this in store; if not present, we treat as false.
  const settingsOpen = useUiStore((s: any) => (typeof s.settingsOpen === "boolean" ? s.settingsOpen : false));

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFavoriteOnly, setDraftFavoriteOnly] = useState<boolean>(!!albumFilters.favoriteOnly);

  const toastNow = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    setDraftFavoriteOnly(!!albumFilters.favoriteOnly);
  }, [filtersOpen, albumFilters.favoriteOnly]);

  const viewerId = viewer.isOpen ? viewer.husketId : null;

  const deckItems: Husket[] = useMemo(() => {
    if (!activeLifeId) return [];
    const all = listByLife(activeLifeId, false);
    if (albumFilters.favoriteOnly) return all.filter((x) => x.isFavorite);
    return all;
  }, [activeLifeId, albumFilters.favoriteOnly, panel, viewer.isOpen, viewerId]);

  // Contract 9.1: If album is empty -> go directly to Capture
  useEffect(() => {
    if (!activeLifeId) return;
    if (panel !== "album") return;

    const count = listByLife(activeLifeId, false).length;
    if (count === 0) {
      goToPanel("capture");
    }
  }, [activeLifeId, panel, goToPanel]);

  // ===============================
  // GLOBAL OVERLAY LOCK
  // When an overlay is open, everything "under" must be inert.
  // This prevents click-through across stacked layers (mobile ghost clicks etc.).
  // ===============================
  const overlayActive = !!(viewer.isOpen || trashOpen || filtersOpen || settingsOpen);

  useEffect(() => {
    // Make the entire document inert, then allow only overlay roots to receive events
    // (those overlays should have pointerEvents:auto themselves).
    if (overlayActive) {
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.pointerEvents = "";
    }

    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [overlayActive]);

  // ===============================
  // two-panel swipe (Album <-> Capture)
  // Disabled whenever overlay is active
  // ===============================
  const drag = useRef<{ startX: number; startY: number; active: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (overlayActive) return;

    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === "textarea" || tag === "input" || tag === "button" || tag === "select") return;

    drag.current = { startX: e.clientX, startY: e.clientY, active: true };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (overlayActive) {
      drag.current = null;
      return;
    }

    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (Math.abs(dx) < 60) return;
    if (Math.abs(dy) > 80) return;

    if (panel === "album" && dx > 0) {
      goToPanel("capture");
      if (hintCount < 10) bumpHint();
      if (hintCount < 10) toastNow("Visste du: du kan sveipe mellom visninger");
      return;
    }

    if (panel === "capture" && dx < 0) {
      goToPanel("album");
      if (hintCount < 10) bumpHint();
      if (hintCount < 10) toastNow("Visste du: du kan sveipe mellom visninger");
      return;
    }
  };

  const versionLabel = useMemo(() => "Core v1 • offline • 0.1.14", []);

  if (boot === "splash") {
    return <SplashScreen onDone={() => setBoot("ready")} />;
  }

  if (!activeLifeId) {
    return (
      <>
        <LifePickerScreen versionLabel={versionLabel} />
        <ToastHost message={toast} />
      </>
    );
  }

  const applyFilters = () => {
    setAlbumFilters({ favoriteOnly: draftFavoriteOnly ? true : undefined });
    setFiltersOpen(false);
    toastNow("Filtre oppdatert.");
  };

  const clearFilters = () => {
    clearAlbumFilters();
    setDraftFavoriteOnly(false);
    toastNow("Filtervalg tømt.");
  };

  return (
    // NOTE: We keep pointer handlers on the shell; overlayActive disables them.
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* Base chrome */}
      <TopBar onOpenFilters={() => setFiltersOpen(true)} />
      <SettingsDrawer />
      <BottomNav />
      <ToastHost message={toast} />

      {/* Main content: will be inert when overlayActive=true because body pointer-events is none. */}
      {panel === "album" ? (
        <AlbumScreen onOpenViewer={(id) => openViewer(id)} />
      ) : (
        <CaptureScreen onToast={toastNow} />
      )}

      {/* Filters overlay (must explicitly allow pointer events) */}
      {filtersOpen ? (
        <div className="modalOverlay" style={{ pointerEvents: "auto" }} onClick={() => setFiltersOpen(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">Filter</h3>

            <div className="label">Favoritt</div>
            <div className="ratingRow">
              <button
                className={`pill ${draftFavoriteOnly ? "active" : ""}`}
                onClick={() => setDraftFavoriteOnly((v) => !v)}
              >
                Vis kun favoritter
              </button>
            </div>

            <div className="modalActions">
              <button className="flatBtn" onClick={clearFilters}>
                Tøm valg
              </button>
              <button className="flatBtn primary" onClick={applyFilters}>
                Filtrer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Trash overlay (allow pointer events) */}
      {trashOpen ? (
        <div style={{ pointerEvents: "auto" }}>
          <TrashScreen onClose={closeTrash} onToast={toastNow} />
        </div>
      ) : null}

      {/* Viewer overlay (allow pointer events) */}
      {viewer.isOpen && viewerId ? (
        <div style={{ pointerEvents: "auto" }}>
          <ViewerDeckModal
            items={deckItems}
            husketId={viewerId}
            onClose={closeViewer}
            onToast={toastNow}
            onNavigateToId={(id) => openViewer(id)}
          />
        </div>
      ) : null}
    </div>
  );
}
