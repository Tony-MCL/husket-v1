// ===============================
// src/app/App.tsx
// Wire-up / panel container / gestures (two-panel v1)
// ===============================
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { SplashScreen } from "../screens/SplashScreen";
import { LifePickerScreen } from "../screens/LifePickerScreen";
import { AlbumScreen } from "../screens/AlbumScreen";
import { CaptureScreen } from "../screens/CaptureScreen";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { SettingsDrawer } from "../components/SettingsDrawer";
import { ToastHost } from "../components/ToastHost";

type BootPhase = "splash" | "ready";

export function App() {
  const [boot, setBoot] = useState<BootPhase>("splash");
  const [toast, setToast] = useState<string | null>(null);

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const panel = useUiStore((s) => s.panel);
  const goToPanel = useUiStore((s) => s.goToPanel);
  const openViewer = useUiStore((s) => s.openViewer);

  const bumpHint = useUiStore((s) => s.bumpPanelHint);
  const hintCount = useUiStore((s) => s.panelHintCount);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const toastNow = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  // --- two-panel swipe (Album <-> Capture)
  const drag = useRef<{ startX: number; startY: number; active: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Avoid when interacting with inputs/buttons
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

    // Horizontal swipe only (ignore vertical)
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

  const versionLabel = useMemo(() => "Core v1 • offline • 0.1.0", []);

  if (boot === "splash") {
    return <SplashScreen onDone={() => setBoot("ready")} />;
  }

  // Life picker must happen before app usage (contract)
  if (!activeLifeId) {
    return (
      <>
        <LifePickerScreen versionLabel={versionLabel} />
        <ToastHost message={toast} />
      </>
    );
  }

  return (
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <TopBar onOpenFilters={() => setFiltersOpen(true)} />

      {/* Filters panel placeholder (next pakke) */}
      {filtersOpen ? (
        <>
          <div className="modalOverlay" onClick={() => setFiltersOpen(false)}>
            <div className="modalBox" onClick={(e) => e.stopPropagation()}>
              <h3 className="modalTitle">Filter (kommer i neste pakke)</h3>
              <div className="smallHelp">
                Kontrakt: dato/kategori/rating/favoritt + “Filtrer” og “Tøm valg”.
              </div>
              <div className="modalActions">
                <button className="flatBtn danger" onClick={() => setFiltersOpen(false)}>
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </>
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
