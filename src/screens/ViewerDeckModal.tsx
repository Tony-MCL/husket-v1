// ===============================
// src/screens/ViewerDeckModal.tsx
// - Overlay for viewer (deck)
// - FIX: Remove the extra close "X" in the top-right
// - Close is handled by the card's own "Lukk" button (and Escape on desktop)
// - Robust repo calls: do not assume exact export names for delete/trash
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import type { Husket } from "../domain/types";
import { HusketSwipeDeck } from "../components/HusketSwipeDeck";
import * as husketRepo from "../data/husketRepo";

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

function pickFn<T extends (...args: any[]) => any>(candidates: Array<T | undefined | null>): T | null {
  for (const fn of candidates) {
    if (typeof fn === "function") return fn;
  }
  return null;
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
    if (cur.id !== husketId) onNavigateToId(cur.id);
  }, [cur?.id, husketId, onNavigateToId]);

  const deleteToTrashFn = useMemo(() => {
    const m = husketRepo as any;
    return pickFn([
      m.deleteHusket,
      m.trashHusket,
      m.moveToTrash,
      m.softDeleteHusket,
      m.removeHusketToTrash,
      m.deleteToTrash,
    ]) as null | ((id: string) => unknown);
  }, []);

  const toggleFavoriteFn = useMemo(() => {
    const m = husketRepo as any;
    return pickFn([m.toggleFavorite, m.setFavorite, m.toggleHusketFavorite]) as null | ((id: string) => unknown);
  }, []);

  const onDeleteCurrent = async () => {
    if (!cur) return;

    if (!deleteToTrashFn) {
      onToast("Fant ikke slett-funksjon i husketRepo.");
      return;
    }

    await Promise.resolve(deleteToTrashFn(cur.id));
    onToast("Flyttet til papirkurv.");

    const nextLen = items.length - 1;
    if (nextLen <= 0) {
      onClose();
      return;
    }
    setIndex((prev) => clampIndex(prev, nextLen));
  };

  const onToggleFav = async () => {
    if (!cur) return;

    if (!toggleFavoriteFn) {
      onToast("Fant ikke favoritt-funksjon i husketRepo.");
      return;
    }

    await Promise.resolve(toggleFavoriteFn(cur.id));
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
      onClick={() => onClose()}
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
          onToggleFavorite={() => void onToggleFav()}
          onDeleteCurrent={() => void onDeleteCurrent()}
        />
      </div>
    </div>
  );
}
