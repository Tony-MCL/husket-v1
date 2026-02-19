// ===============================
// src/screens/AlbumScreen.tsx
// Minimal v1 skeleton (grid + empty state)
// Now includes: trash button (bottom-left) and uses filters (favoriteOnly)
// v0.2.1: react to repo writes so album updates immediately after delete/favorite
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { listByLife, subscribeRepo } from "../data/husketRepo";
import type { Husket } from "../domain/types";

export function AlbumScreen(props: { onOpenViewer: (id: string) => void }) {
  const { onOpenViewer } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const filters = useUiStore((s) => s.albumFilters);
  const openTrash = useUiStore((s) => s.openTrash);

  const [repoTick, setRepoTick] = useState(0);

  useEffect(() => {
    // Re-render album when repo writes happen (same-tab localStorage updates)
    const unsub = subscribeRepo(() => {
      setRepoTick((x) => x + 1);
    });
    return unsub;
  }, []);

  const items: Husket[] = useMemo(() => {
    if (!activeLifeId) return [];
    // repoTick forces recalculation when data changes
    const all = listByLife(activeLifeId, false);

    if (filters.favoriteOnly) return all.filter((x) => x.isFavorite);

    return all;
  }, [activeLifeId, filters.favoriteOnly, repoTick]);

  if (!activeLifeId) {
    return <div className="appShell">Ingen aktivt liv.</div>;
  }

  // NOTE: App.tsx handles auto-redirect to Capture when empty.
  return (
    <div className="appShell" style={{ paddingTop: 74 }}>
      {/* Trash button (global admin, visible in Album only) */}
      <button
        className="flatBtn"
        onClick={openTrash}
        style={{
          position: "fixed",
          left: 10,
          bottom: 96,
          zIndex: 25,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)"
        }}
      >
        Papirkurv
      </button>

      {items.length === 0 ? (
        <div className="smallHelp" style={{ textAlign: "center", marginTop: 24 }}>
          Tomt album.
        </div>
      ) : (
        <div className="albumGrid">
          {items.map((h) => (
            <button
              key={h.id}
              className="thumb"
              style={{ padding: 0, border: "1px solid var(--line)", textAlign: "left" }}
              onClick={() => onOpenViewer(h.id)}
            >
              <img className="thumbImg" src={h.imageDataUrl} alt="" />
              <div className="thumbMeta">
                <span>{new Date(h.createdAt).toLocaleDateString("no-NO")}</span>
                <span className="badge">{h.isFavorite ? "★" : "—"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
