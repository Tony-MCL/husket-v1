// ===============================
// src/components/BottomNav.tsx
// Buttons always available (not swipe-dependent)
// ===============================
import React from "react";
import { useUiStore } from "../state/uiStore";

export function BottomNav() {
  const panel = useUiStore((s) => s.panel);
  const goToPanel = useUiStore((s) => s.goToPanel);

  return (
    <div className="bottomNav">
      <div className="bottomNavInner">
        <button
          className={`bottomBtn ${panel === "album" ? "active" : ""}`}
          onClick={() => goToPanel("album")}
        >
          Album
        </button>

        <button
          className={`bottomBtn ${panel === "capture" ? "active" : ""}`}
          onClick={() => goToPanel("capture")}
        >
          Capture
        </button>

        <button
          className="bottomBtn"
          onClick={() => alert("Viewer åpnes ved å trykke på et bilde i albumet (neste pakke).")}
        >
          Viewer
        </button>
      </div>
    </div>
  );
}
