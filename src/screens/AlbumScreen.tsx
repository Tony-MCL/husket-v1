// ===============================
// src/screens/AlbumScreen.tsx
// Minimal v1 skeleton (grid + empty state)
//
// v0.2.6:
// - Album uses shared filter motor (category/rating/date + favoriteOnly)
// - Album reacts to repo writes (subscribeRepo tick)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { listByLife, subscribeRepo } from "../data/husketRepo";
import type { Husket } from "../domain/types";
import { applyAlbumFilters } from "../domain/applyAlbumFilters";

export function AlbumScreen(props: { onOpenViewer: (id: string) => void }) {
  const { onOpenViewer } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const filters = useUiStore((s) => s.albumFilters);
  const openTrash = useUiStore((s) => s.openTrash);

  const [repoTick, setRepoTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeRepo(() => setRepoTick((x) => x + 1));
    return unsub;
  }, []);

  const items: Husket[] = useMemo(() => {
    if (!activeLifeId) return [];
    void repoTick;

    const all = listByLife(activeLifeId, false);
    const filtered = applyAlbumFilters(all, filters);

    return filtered;
  }, [
    activeLifeId,
    repoTick,
    filters.favoriteOnly,
    filters.categoryId,
    filters.ratingId,
    filters.datePreset,
    filters.customFrom,
    filters.customTo
  ]);

  if (!activeLifeId) {
    return <div className="appShell">Ingen aktivt liv.</div>;
  }

  return (
    <div className="appShell" style={{ paddingTop: 74 }}>
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
