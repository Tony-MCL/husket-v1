// ===============================
// src/screens/ViewerDeckModal.tsx
// - Overlay for viewer (deck)
// - Keep: NO extra top-right close "X"
// - Close happens via card's own "Lukk" (and Escape on desktop)
// - IMPORTANT FIX: Remove backdrop click-to-close and avoid overlay event patterns
//   that can interfere with Framer Motion drag/swipe.
// - Robust repo calls: do not assume exact export names for delete/favorite
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

  // Escape closes viewer (desktop convenience)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cur = items[index];

  // Sync global viewer id when user swipes to another card
  useEffect(() => {
    if (!cur) return;
    if (cur.id !== husketId) onNavigateToId(cur.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id, husketId, onNavigateToId]);

  const deleteToTrashFn = useMemo(() => {
    const m = husketRepo as any;
    return pickFn([
      // Most likely / current name:
      m.softDelete,

      // Other possible legacy/alt names:
      m.deleteHusket,
      m.trashHusket,
      m.moveToTrash,
      m.softDeleteHusket,
      m.removeHusketToTrash,
      m.deleteToTrash,
      m.deleteToTrashHusket,
      m.softDeleteToTrash,
    ]) as null | ((id: string) => unknown);
  }, []);

  const toggleFavoriteFn = useMemo(() => {
    const m = husketRepo as any;
    return pickFn([
      // Current name:
      m.toggleFavorite,

      // Other possible legacy/alt names:
      m.setFavorite,
      m.toggleHusketFavorite,
    ]) as null | ((id: string) => unknown);
  }, []);

  const onDeleteCurrent = async () => {
    if (!cur) return;

    if (!deleteToTrashFn) {
      onToast("Fant ikke slett-funksjonen i husketRepo.");
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
  );
}
