// ===============================
// src/screens/LifePickerScreen.tsx
// First-run picker (Privat/Jobb) + Premium entry point
// ===============================
import React from "react";
import { useUiStore } from "../state/uiStore";

export function LifePickerScreen(props: { versionLabel: string }) {
  const { versionLabel } = props;

  const setActiveLifeId = useUiStore((s) => s.setActiveLifeId);

  return (
    <div className="appShell" style={{ display: "grid", alignContent: "center", gap: 14 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.5px" }}>husk’et</div>
        <div className="smallHelp" style={{ marginTop: 6 }}>
          Velg liv for å starte
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <button className="flatBtn primary" onClick={() => setActiveLifeId("private")}>
          Privat
        </button>
        <button className="flatBtn primary" onClick={() => setActiveLifeId("work")}>
          Jobb
        </button>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <button className="flatBtn" onClick={() => alert("Premium kommer senere (placeholder).")}>
          Kjøp Premium
        </button>

        <div className="smallHelp" style={{ textAlign: "center", marginTop: 10 }}>
          {versionLabel}
        </div>
      </div>
    </div>
  );
}
