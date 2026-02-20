// ===============================
// src/app/App.tsx
// v0.2.13: live refresh on repo changes (favorites/categories/etc.)
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
import { CategoryConfigScreen } from "../screens/CategoryConfigScreen";

type BootPhase = "splash" | "ready";

export function App() {
  const [boot, setBoot] = useState<BootPhase>("splash");
  const [toast, setToast] = useState<string | null>(null);

  // NEW: repo tick to force UI recompute on localStorage writes
  const [repoTick, setRepoTick] = useState(0);

  useEffect(() => {
    const onRepo = () => setRepoTick((t) => t + 1);
    window.addEventListener("husket:repoChanged", onRepo);
    return () => window.removeEventListener("husket:repoChanged", onRepo);
  }, []);

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

  const settingsOpen = useUiStore((s) => s.settingsOpen);

  const categoryConfigOpen = useUiStore((s) => s.categoryConfigOpen);
  const closeCategoryConfig = useUiStore((s) => s.closeCategoryConfig);

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
  }, [activeLifeId, albumFilters.favoriteOnly, panel, viewer.isOpen, viewerId, repoTick]);

  useEffect(() => {
    if (!activeLifeId) return;
    if (panel !== "album") return;

    const count = listByLife(activeLifeId, false).length;
    if (count === 0) {
      goToPanel("capture");
    }
  }, [activeLifeId, panel, goToPanel, repoTick]);

  const overlayActive = !!(viewer.isOpen || trashOpen || filtersOpen || settingsOpen || categoryConfigOpen);

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

  const versionLabel = useMemo(() => "Core v1 • offline • 0.2.13", []);

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

  const baseShellStyle: React.CSSProperties = {
    pointerEvents: overlayActive ? "none" : "auto"
  };

  const overlayHostStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2000000,
    pointerEvents: "auto"
  };

  return (
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div style={baseShellStyle}>
        <TopBar onOpenFilters={() => setFiltersOpen(true)} />

        {panel === "album" ? (
          <AlbumScreen onOpenViewer={(id) => openViewer(id)} repoTick={repoTick} />
        ) : (
          <CaptureScreen onToast={toastNow} />
        )}

        <BottomNav />
      </div>

      <ToastHost message={toast} />
      <SettingsDrawer />

      {filtersOpen ? (
        <div className="modalOverlay" style={{ ...overlayHostStyle, zIndex: 3500000 }} onClick={() => setFiltersOpen(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">Filter</h3>

            <div className="label">Favoritt</div>
            <div className="ratingRow">
              <button className={`pill ${draftFavoriteOnly ? "active" : ""}`} onClick={() => setDraftFavoriteOnly((v) => !v)}>
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

      {trashOpen ? (
        <div style={{ ...overlayHostStyle, zIndex: 3600000 }}>
          <TrashScreen onClose={closeTrash} onToast={toastNow} />
        </div>
      ) : null}

      {categoryConfigOpen ? (
        <div style={{ ...overlayHostStyle, zIndex: 3650000 }}>
          <CategoryConfigScreen lifeId={activeLifeId} onClose={closeCategoryConfig} onToast={toastNow} hasPro={false} />
        </div>
      ) : null}

      {viewer.isOpen && viewerId ? (
        <div style={{ ...overlayHostStyle, zIndex: 3700000 }}>
          <ViewerDeckModal items={deckItems} husketId={viewerId} onClose={closeViewer} onToast={toastNow} onNavigateToId={(id) => openViewer(id)} />
        </div>
      ) : null}
    </div>
  );
}
