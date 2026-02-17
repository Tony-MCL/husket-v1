// ===============================
// src/screens/AlbumScreen.tsx
// Minimal v1 skeleton (grid + empty state)
// Papirkurv-knapp og filter UI kommer i neste pakke.
// ===============================
import React, { useMemo } from "react";
import { useUiStore } from "../state/uiStore";
import { listByLife } from "../data/husketRepo";

export function AlbumScreen(props: { onOpenViewer: (id: string) => void }) {
  const { onOpenViewer } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const filters = useUiStore((s) => s.albumFilters);

  const items = useMemo(() => {
    if (!activeLifeId) return [];
    const all = listByLife(activeLifeId, false);

    // Minimal filter stub: favoriteOnly only (others added later)
    if (filters.favoriteOnly) return all.filter((x) => x.isFavorite);

    return all;
  }, [activeLifeId, filters.favoriteOnly]);

  if (!activeLifeId) {
    return <div className="appShell">Ingen aktivt liv.</div>;
  }

  if (items.length === 0) {
    return (
      <div className="appShell" style={{ paddingTop: 74 }}>
        <div className="smallHelp" style={{ textAlign: "center", marginTop: 24 }}>
          Tomt album. Gå til Capture for å lage ditt første husk’et.
        </div>
      </div>
    );
  }

  return (
    <div className="appShell" style={{ paddingTop: 74 }}>
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
    </div>
  );
}
