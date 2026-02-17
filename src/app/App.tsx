// ===============================
// src/app/App.tsx
// Wire-up / panel container / gestures (two-panel v1)
// Includes:
// - Auto redirect to Capture when album empty (contract 9.1)
// - Filter panel (favoriteOnly) with Apply/Clear buttons
// - Trash modal wiring
// - Viewer modal wiring (favorite + delete -> trash)
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
import { ViewerModal } from "../screens/ViewerModal";
import { listByLife } from "../data/husketRepo";

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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFavoriteOnly, setDraftFavoriteOnly] = useState<boolean>(!!albumFilters.favoriteOnly);

  const toastNow = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  // Keep draft in sync when opening filters
  useEffect(() => {
    if (!filtersOpen) return;
    setDraftFavoriteOnly(!!albumFilters.favoriteOnly);
  }, [filtersOpen, albumFilters.favoriteOnly]);

  // Contract 9.1: If album is empty -> go directly to Capture
  useEffect(() => {
    if (!activeLifeId) return;
    if (panel !== "album") return;

    const count = listByLife(activeLifeId, false).length;
    if (count === 0) {
      goToPanel("capture");
    }
  }, [activeLifeId, panel, goToPanel]);

  // --- two-panel swipe (Album <-> Capture)
  const drag = useRef<{ startX: number; startY: number; active: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Prevent panel swipe while viewer/trash/filters are open
    if (filtersOpen || trashOpen || viewer.isOpen) return;

    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === "textarea" || tag === "input" || tag === "button" || tag === "select") return;

    drag.current = { startX: e.clientX, startY: e.clientY, active: true };
  };

  const onPointerUp = (e: React.PointerEvent) => {
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

  const versionLabel = useMemo(() => "Core v1 • offline • 0.1.3", []);

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
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <TopBar onOpenFilters={() => setFiltersOpen(true)} />

      {/* Filters panel (v1: favorite only; structure matches contract) */}
      {filtersOpen ? (
        <div className="modalOverlay" onClick={() => setFiltersOpen(false)}>
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

      {/* Trash (global admin) */}
      {trashOpen ? <TrashScreen onClose={closeTrash} onToast={toastNow} /> : null}

      {/* Viewer (light modal) */}
      {viewer.isOpen ? (
        <ViewerModal husketId={viewer.husketId} onClose={closeViewer} onToast={toastNow} />
      ) : null}

      {/* Screen content */}
      {panel === "album" ? (
        <AlbumScreen onOpenViewer={(id) => openViewer(id)} />
      ) : (
        <CaptureScreen onToast={toastNow} />
      )}

      <SettingsDrawer />
      <BottomNav />
      <ToastHost message={toast} />
    </div>
  );
}
