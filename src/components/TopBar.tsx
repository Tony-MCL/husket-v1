// ===============================
// src/components/TopBar.tsx
// Transparent overlay TopBar (per kontrakt)
// ===============================
import React from "react";
import { useUiStore } from "../state/uiStore";
import type { LifeId } from "../domain/types";

function labelForLife(lifeId: LifeId) {
  if (lifeId === "private") return "Privat";
  if (lifeId === "work") return "Jobb";
  if (lifeId === "custom1") return "Egendefinert 1";
  return "Egendefinert 2";
}

export function TopBar(props: { onOpenFilters: () => void }) {
  const { onOpenFilters } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const openSettings = useUiStore((s) => s.openSettings);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 20,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 10px 0",
          pointerEvents: "auto"
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "10px 12px",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(8px)"
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1 }}>
            {activeLifeId ? labelForLife(activeLifeId) : "—"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="flatBtn" onClick={onOpenFilters} aria-label="Filter">
            Filter
          </button>

          <button className="hamburger" onClick={openSettings} aria-label="Settings">
            <span className="hamburgerLines" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
