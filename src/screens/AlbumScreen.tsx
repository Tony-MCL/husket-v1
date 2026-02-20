// ===============================
// src/screens/AlbumScreen.tsx
// Minimal v1 skeleton (grid + empty state)
// Now includes: trash button (bottom-left) and uses filters (favoriteOnly)
//
// v0.2.13:
// - Re-render when repo changes (repoTick) so favorites/categories update live.
// ===============================
import React, { useMemo } from "react";
import { useUiStore } from "../state/uiStore";
import { listByLife } from "../data/husketRepo";

export function AlbumScreen(props: { onOpenViewer: (id: string) => void; repoTick: number }) {
  const { onOpenViewer, repoTick } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const filters = useUiStore((s) => s.albumFilters);
  const openTrash = useUiStore((s) => s.openTrash);

  const items = useMemo(() => {
    if (!activeLifeId) return [];
    const all = listByLife(activeLifeId, false);

    if (filters.favoriteOnly) return all.filter((x) => x.isFavorite);

    return all;
  }, [activeLifeId, filters.favoriteOnly, repoTick]);

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
