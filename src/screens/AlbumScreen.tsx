// ===============================
// src/screens/AlbumScreen.tsx
//
// v0.2.7:
// - show category badge in meta (simple)
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
    return applyAlbumFilters(all, filters);
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
              <div className="thumbMeta" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>{new Date(h.createdAt).toLocaleDateString("no-NO")}</span>
                <span className="badge">{h.categoryId ? `🏷` : "—"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
