// ===============================
// src/screens/ViewerDeckModal.tsx
// Wrapper for HusketSwipeDeck
// IMPORTANT: Do NOT use "modalBox" here (it may cover the whole screen and block clicks).
// ===============================
import React, { useMemo } from "react";
import type { Husket } from "../domain/types";
import { HusketSwipeDeck } from "../components/HusketSwipeDeck";
import { toggleFavorite, softDelete } from "../data/husketRepo";

export function ViewerDeckModal(props: {
  items: Husket[];
  husketId: string;
  onClose: () => void;
  onToast: (msg: string) => void;
  onNavigateToId: (id: string) => void;
}) {
  const { items, husketId, onClose, onToast, onNavigateToId } = props;

  const index = useMemo(() => {
    const i = items.findIndex((x) => x.id === husketId);
    return i >= 0 ? i : 0;
  }, [items, husketId]);

  const current = items[index];

  const doSetIndex = (nextIndex: number) => {
    const next = items[nextIndex];
    if (!next) return;
    onNavigateToId(next.id);
  };

  const doToggleFavorite = () => {
    if (!current) return;
    toggleFavorite(current.id);
    onToast(current.isFavorite ? "Fjernet favoritt." : "Lagt til som favoritt.");
    onNavigateToId(current.id);
  };

  const doDelete = () => {
    if (!current) return;
    const ok = window.confirm("Flytt dette husk’et til papirkurv?");
    if (!ok) return;

    softDelete(current.id);
    onToast("Flyttet til papirkurv.");

    const remaining = items.filter((x) => x.id !== current.id);
    if (remaining.length === 0) {
      onClose();
      return;
    }

    const nextIndex = Math.min(index, remaining.length - 1);
    const next = remaining[nextIndex];
    if (!next) {
      onClose();
      return;
    }

    onNavigateToId(next.id);
  };

  // If the deck is empty, show a safe close UI (should not happen if Album had items)
  if (items.length === 0) {
    return (
      <div className="modalOverlay" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(92vw, 560px)",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.10)",
            padding: 14
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Viewer</div>
          <div className="smallHelp">Ingen kort å vise.</div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="flatBtn" onClick={onClose}>
              Lukk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      {/* IMPORTANT: this container must NOT cover the whole screen */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(92vw, 560px)",
          height: "min(86vh, 860px)",
          position: "relative",
          borderRadius: 22,
          overflow: "visible"
        }}
      >
        {/* Always-visible close button (so user is never stuck) */}
        <button
          type="button"
          className="flatBtn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            zIndex: 2000,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)"
          }}
          aria-label="Lukk viewer"
          title="Lukk"
        >
          ✕
        </button>

        <HusketSwipeDeck
          items={items}
          index={index}
          onSetIndex={doSetIndex}
          onClose={onClose}
          onToggleFavorite={doToggleFavorite}
          onDeleteCurrent={doDelete}
        />
      </div>
    </div>
  );
}
