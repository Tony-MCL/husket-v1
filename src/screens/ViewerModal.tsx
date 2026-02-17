// ===============================
// src/screens/ViewerModal.tsx
// Light viewer modal (no swipe yet)
// - Favorite toggle
// - Delete -> trash (soft delete)
// ===============================
import React, { useMemo } from "react";
import { getById, softDelete, toggleFavorite } from "../data/husketRepo";

export function ViewerModal(props: {
  husketId: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const { husketId, onClose, onToast } = props;

  const husket = useMemo(() => getById(husketId), [husketId]);

  if (!husket) {
    return (
      <div className="modalOverlay" onClick={onClose}>
        <div className="modalBox" onClick={(e) => e.stopPropagation()}>
          <h3 className="modalTitle">Viewer</h3>
          <div className="smallHelp">Fant ikke husk’et (kan være slettet).</div>
          <div className="modalActions">
            <button className="flatBtn" onClick={onClose}>
              Lukk
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doToggleFavorite = () => {
    toggleFavorite(husket.id);
    onToast(husket.isFavorite ? "Fjernet favoritt." : "Lagt til som favoritt.");
    // Close + reopen is not necessary; Album will reflect on next render.
    onClose();
  };

  const doDelete = () => {
    const ok = window.confirm("Flytt dette husk’et til papirkurv?");
    if (!ok) return;
    softDelete(husket.id);
    onToast("Flyttet til papirkurv.");
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Viewer</h3>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(27, 26, 23, 0.02)"
          }}
        >
          <img src={husket.imageDataUrl} alt="" style={{ width: "100%", display: "block" }} />
        </div>

        <div style={{ marginTop: 10 }} className="viewerMetaLine">
          <span>{new Date(husket.createdAt).toLocaleString("no-NO")}</span>
          <span className="badge">{husket.isFavorite ? "★ Favoritt" : "—"}</span>
        </div>

        {husket.comment ? (
          <div style={{ marginTop: 10 }} className="smallHelp">
            {husket.comment}
          </div>
        ) : (
          <div style={{ marginTop: 10 }} className="smallHelp">
            — Ingen kommentar —
          </div>
        )}

        <div className="modalActions">
          <button className="flatBtn" onClick={doToggleFavorite}>
            {husket.isFavorite ? "Fjern favoritt" : "Gjør til favoritt"}
          </button>
          <button className="flatBtn danger" onClick={doDelete}>
            Slett
          </button>
          <button className="flatBtn" onClick={onClose}>
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
