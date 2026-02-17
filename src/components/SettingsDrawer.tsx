// ===============================
// src/components/SettingsDrawer.tsx
// ===============================
import React from "react";
import { useUiStore } from "../state/uiStore";

export function SettingsDrawer() {
  const open = useUiStore((s) => s.settingsOpen);
  const close = useUiStore((s) => s.closeSettings);

  if (!open) return null;

  return (
    <>
      <div className="drawerOverlay" onClick={close} />
      <aside className="drawer" role="dialog" aria-label="Settings">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>Innstillinger</div>
          <button className="flatBtn danger" onClick={close}>
            Lukk
          </button>
        </div>

        <div className="hr" />

        <div className="smallHelp" style={{ marginBottom: 10 }}>
          Core v1 er 100% offline. Premium/Skydeling kommer senere.
        </div>

        <button
          className="flatBtn primary"
          onClick={() => {
            alert("Premium-kjøp kommer senere (placeholder).");
          }}
        >
          Kjøp Premium
        </button>

        <div className="hr" />

        <div className="smallHelp">Papirkurv kommer i neste pakke (global administrasjon).</div>
      </aside>
    </>
  );
}
