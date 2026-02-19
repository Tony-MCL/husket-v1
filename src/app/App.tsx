// ===============================
// src/app/App.tsx
// v0.2.6:
// - Shared filter motor for album + viewer deck
// - Real filter UI for favorite/category/rating/date (AND logic)
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
import type { Husket, DatePreset } from "../domain/types";
import { applyAlbumFilters } from "../domain/applyAlbumFilters";

type BootPhase = "splash" | "ready";

function uniqSorted(values: Array<string | undefined>): string[] {
  const s = new Set<string>();
  for (const v of values) if (typeof v === "string" && v.trim()) s.add(v);
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

function toDateInputValue(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const y = String(d.getFullYear()).padStart(4, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputValue(value: string): number | undefined {
  if (!value) return undefined;
  // Interpret as local date, midnight
  const [y, m, d] = value.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return dt.getTime();
}

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

  const settingsOpen = useUiStore((s) => s.settingsOpen);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Draft filter state (local only; store updated on "Filtrer")
  const [draftFavoriteOnly, setDraftFavoriteOnly] = useState<boolean>(!!albumFilters.favoriteOnly);
  const [draftCategoryId, setDraftCategoryId] = useState<string>(albumFilters.categoryId ?? "");
  const [draftRatingId, setDraftRatingId] = useState<string>(albumFilters.ratingId ?? "");
  const [draftDatePreset, setDraftDatePreset] = useState<DatePreset>(albumFilters.datePreset ?? "week");
  const [draftFrom, setDraftFrom] = useState<string>(toDateInputValue(albumFilters.customFrom));
  const [draftTo, setDraftTo] = useState<string>(toDateInputValue(albumFilters.customTo));

  const toastNow = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    setDraftFavoriteOnly(!!albumFilters.favoriteOnly);
    setDraftCategoryId(albumFilters.categoryId ?? "");
    setDraftRatingId(albumFilters.ratingId ?? "");
    setDraftDatePreset(albumFilters.datePreset ?? "week");
    setDraftFrom(toDateInputValue(albumFilters.customFrom));
    setDraftTo(toDateInputValue(albumFilters.customTo));
  }, [filtersOpen, albumFilters]);

  const viewerId = viewer.isOpen ? viewer.husketId : null;

  // Base list (life only). Filters applied below via shared motor.
  const lifeItems: Husket[] = useMemo(() => {
    if (!activeLifeId) return [];
    return listByLife(activeLifeId, false);
  }, [activeLifeId, panel, viewer.isOpen, viewerId, albumFilters.favoriteOnly, albumFilters.categoryId, albumFilters.ratingId, albumFilters.datePreset, albumFilters.customFrom, albumFilters.customTo]);

  const deckItems: Husket[] = useMemo(() => {
    return applyAlbumFilters(lifeItems, albumFilters);
  }, [
    lifeItems,
    albumFilters.favoriteOnly,
    albumFilters.categoryId,
    albumFilters.ratingId,
    albumFilters.datePreset,
    albumFilters.customFrom,
    albumFilters.customTo
  ]);

  // Options for filter dropdowns derived from existing data in the active life
  const categoryOptions = useMemo(() => {
    return uniqSorted(lifeItems.map((x) => x.categoryId));
  }, [lifeItems]);

  const ratingOptions = useMemo(() => {
    return uniqSorted(lifeItems.map((x) => x.ratingId));
  }, [lifeItems]);

  // Contract 9.1: If album is empty -> go directly to Capture
  useEffect(() => {
    if (!activeLifeId) return;
    if (panel !== "album") return;

    const count = listByLife(activeLifeId, false).length;
    if (count === 0) {
      goToPanel("capture");
    }
  }, [activeLifeId, panel, goToPanel]);

  const overlayActive = !!(viewer.isOpen || trashOpen || filtersOpen || settingsOpen);

  // two-panel swipe (Album <-> Capture) disabled whenever overlayActive
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

  const versionLabel = useMemo(() => "Core v1 • offline • 0.2.6", []);

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
    const preset = draftDatePreset;

    const patch: any = {
      favoriteOnly: draftFavoriteOnly ? true : undefined,
      categoryId: draftCategoryId ? draftCategoryId : undefined,
      ratingId: draftRatingId ? draftRatingId : undefined,
      datePreset: preset
    };

    if (preset === "custom") {
      const from = fromDateInputValue(draftFrom);
      const to = fromDateInputValue(draftTo);
      patch.customFrom = typeof from === "number" ? from : undefined;
      patch.customTo = typeof to === "number" ? to : undefined;
    } else {
      patch.customFrom = undefined;
      patch.customTo = undefined;
    }

    setAlbumFilters(patch);
    setFiltersOpen(false);
    toastNow("Filtre oppdatert.");
  };

  const clearFilters = () => {
    clearAlbumFilters();
    setDraftFavoriteOnly(false);
    setDraftCategoryId("");
    setDraftRatingId("");
    setDraftDatePreset("week");
    setDraftFrom("");
    setDraftTo("");
    toastNow("Filtervalg tømt.");
  };

  const baseShellStyle: React.CSSProperties = {
    pointerEvents: overlayActive ? "none" : "auto",
  };

  const overlayHostStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2000000,
    pointerEvents: "auto",
  };

  return (
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div style={baseShellStyle}>
        <TopBar onOpenFilters={() => setFiltersOpen(true)} />

        {panel === "album" ? (
          <AlbumScreen onOpenViewer={(id) => openViewer(id)} />
        ) : (
          <CaptureScreen onToast={toastNow} />
        )}

        <BottomNav />
      </div>

      <ToastHost message={toast} />

      {settingsOpen ? (
        <div style={{ ...overlayHostStyle, zIndex: 3000000 }}>
          <SettingsDrawer />
        </div>
      ) : (
        <SettingsDrawer />
      )}

      {filtersOpen ? (
        <div className="modalOverlay" style={{ ...overlayHostStyle, zIndex: 3500000 }} onClick={() => setFiltersOpen(false)}>
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

            <div className="label" style={{ marginTop: 14 }}>Kategori</div>
            <select
              value={draftCategoryId}
              onChange={(e) => setDraftCategoryId(e.target.value)}
              className="flatBtn"
              style={{ width: "100%", textAlign: "left" as any }}
            >
              <option value="">Alle kategorier</option>
              {categoryOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>

            <div className="label" style={{ marginTop: 14 }}>Rating</div>
            <select
              value={draftRatingId}
              onChange={(e) => setDraftRatingId(e.target.value)}
              className="flatBtn"
              style={{ width: "100%", textAlign: "left" as any }}
            >
              <option value="">Alle ratings</option>
              {ratingOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>

            <div className="label" style={{ marginTop: 14 }}>Dato</div>
            <div style={{ display: "grid", gap: 10 }}>
              <select
                value={draftDatePreset}
                onChange={(e) => setDraftDatePreset(e.target.value as DatePreset)}
                className="flatBtn"
                style={{ width: "100%", textAlign: "left" as any }}
              >
                <option value="week">Siste 7 dager</option>
                <option value="month">Siste 30 dager</option>
                <option value="year">Siste 365 dager</option>
                <option value="custom">Egendefinert</option>
              </select>

              {draftDatePreset === "custom" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div className="smallHelp">Fra</div>
                    <input
                      type="date"
                      value={draftFrom}
                      onChange={(e) => setDraftFrom(e.target.value)}
                      className="flatBtn"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div className="smallHelp">Til</div>
                    <input
                      type="date"
                      value={draftTo}
                      onChange={(e) => setDraftTo(e.target.value)}
                      className="flatBtn"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              ) : null}
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

      {viewer.isOpen && viewerId ? (
        <div style={{ ...overlayHostStyle, zIndex: 3700000 }}>
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
