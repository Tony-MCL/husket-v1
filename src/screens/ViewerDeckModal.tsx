// ===============================
// src/screens/ViewerDeckModal.tsx
// Wrapper for HusketSwipeDeck
// Uses current album list (active life + active filters) as the deck.
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
    // Hold viewer open; we navigate to same id to refresh the current card reference in App (optional).
    onNavigateToId(current.id);
  };

  const doDelete = () => {
    if (!current) return;
    const ok = window.confirm("Flytt dette husk’et til papirkurv?");
    if (!ok) return;

    softDelete(current.id);
    onToast("Flyttet til papirkurv.");

    // After delete: choose a neighbor card if exists, else close.
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

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalBox"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(100vw - 20px, 560px)",
          maxWidth: "560px",
          padding: 0,
          background: "transparent",
          border: "none",
          boxShadow: "none"
        }}
      >
        <div style={{ height: "min(86vh, 860px)" }}>
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
    </div>
  );
}
