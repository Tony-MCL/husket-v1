// ===============================
// src/screens/ViewerDeckModal.tsx
// - Overlay for viewer (deck)
// - FIX: Remove the extra close "X" in the top-right (it caused layered click conflicts)
// - Close is handled by the card's own "Lukk" button (and Escape on desktop)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import type { Husket } from "../domain/types";
import { HusketSwipeDeck } from "../components/HusketSwipeDeck";
import { deleteHusket, toggleFavorite } from "../data/husketRepo";

type Props = {
  items: Husket[];
  husketId: string;
  onClose: () => void;
  onToast: (msg: string) => void;
  onNavigateToId: (id: string) => void;
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return Math.max(0, Math.min(len - 1, i));
}

export function ViewerDeckModal({ items, husketId, onClose, onToast, onNavigateToId }: Props) {
  const initialIndex = useMemo(() => {
    const idx = items.findIndex((x) => x.id === husketId);
    return idx >= 0 ? idx : 0;
  }, [items, husketId]);

  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cur = items[index];

  useEffect(() => {
    if (!cur) return;
    // Keep global viewer state in sync when user swipes
    if (cur.id !== husketId) onNavigateToId(cur.id);
  }, [cur?.id, husketId, onNavigateToId]);

  const onDeleteCurrent = () => {
    if (!cur) return;
    deleteHusket(cur.id);
    onToast("Flyttet til papirkurv.");

    // After deletion, decide what to show next
    const nextLen = items.length - 1;
    if (nextLen <= 0) {
      onClose();
      return;
    }
    setIndex((prev) => clampIndex(prev, nextLen));
  };

  const onToggleFav = () => {
    if (!cur) return;
    toggleFavorite(cur.id);
    onToast(cur.isFavorite ? "Fjernet favoritt." : "Lagt til som favoritt.");
  };

  return (
    <div
      className="modalOverlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000000,
        pointerEvents: "auto",
      }}
      // Backdrop click closes viewer (optional, keeps it intuitive)
      onClick={() => onClose()}
      // Stop pointer events from bubbling into the app shell
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <HusketSwipeDeck
          items={items}
          index={index}
          onSetIndex={(next) => setIndex(next)}
          onClose={onClose}
          onToggleFavorite={onToggleFav}
          onDeleteCurrent={onDeleteCurrent}
        />
      </div>
    </div>
  );
}
