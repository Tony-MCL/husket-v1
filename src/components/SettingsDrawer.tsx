// ===============================
// src/components/SettingsDrawer.tsx
// Simple, robust slide-in settings drawer.
// - Must always sit BELOW true modals (filter/trash/category) + viewer.
// - When launching a modal from Settings, close Settings first.
//
// v0.2.11
// ===============================
import React from "react";
import { useUiStore } from "../state/uiStore";

function labelForLife(lifeId: string | null) {
  if (lifeId === "private") return "Privat";
  if (lifeId === "work") return "Jobb";
  if (lifeId === "custom1") return "Egendefinert 1";
  if (lifeId === "custom2") return "Egendefinert 2";
  return "—";
}

export function SettingsDrawer() {
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const closeSettings = useUiStore((s) => s.closeSettings);
  const activeLifeId = useUiStore((s) => s.activeLifeId);

  const openTrash = useUiStore((s) => s.openTrash);
  const openCategoryConfig = useUiStore((s) => s.openCategoryConfig);

  if (!settingsOpen) return null;

  const openCategories = () => {
    // Ensure modal can sit above everything
    closeSettings();
    openCategoryConfig();
  };

  const openTrashNow = () => {
    closeSettings();
    openTrash();
  };

  return (
    <div
      className="modalOverlay"
      onClick={closeSettings}
      style={{
        position: "fixed",
        inset: 0,
        // IMPORTANT: SettingsDrawer must be BELOW real modals + viewer
        zIndex: 3000000,
        pointerEvents: "auto"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(380px, 92vw)",
          background: "rgba(255,255,255,0.98)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          padding: 14,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 12
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Settings</div>
          <div className="smallHelp" style={{ marginTop: 4 }}>
            Aktivt liv: <b>{labelForLife(activeLifeId)}</b>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <button className="flatBtn" onClick={openCategories} disabled={!activeLifeId}>
            🏷 Kategorier på Capture
          </button>

          <button className="flatBtn" onClick={openTrashNow}>
            🗑 Papirkurv
          </button>

          <button className="flatBtn" onClick={() => alert("Premium kommer senere (placeholder).")}>
            ⭐ Premium
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="flatBtn" onClick={closeSettings}>
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
