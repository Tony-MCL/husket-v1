// ===============================
// src/screens/TrashScreen.tsx
// Global trash (placeholder UI) – visible from Album + Settings
// ===============================
import React, { useMemo } from "react";
import { emptyTrash, listTrash, restoreFromTrash } from "../data/husketRepo";
import type { LifeId } from "../domain/types";

function labelForLife(lifeId: LifeId) {
  if (lifeId === "private") return "Privat";
  if (lifeId === "work") return "Jobb";
  if (lifeId === "custom1") return "Egendefinert 1";
  return "Egendefinert 2";
}

export function TrashScreen(props: { onClose: () => void; onToast: (msg: string) => void }) {
  const { onClose, onToast } = props;

  const items = useMemo(() => listTrash(), []);

  const doEmpty = () => {
    const ok = window.confirm("Tøm papirkurv permanent?");
    if (!ok) return;
    emptyTrash();
    onToast("Papirkurv tømt.");
    onClose();
  };

  const doRestore = (id: string, toLifeId: LifeId) => {
    restoreFromTrash(id, toLifeId);
    onToast("Gjenopprettet.");
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Papirkurv</h3>

        {items.length === 0 ? (
          <div className="smallHelp">Papirkurven er tom.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((h) => (
              <div
                key={h.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: 10,
                  display: "grid",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div className="smallHelp">
                    {labelForLife(h.deletedFromLifeId ?? h.lifeId)} •{" "}
                    {new Date(h.createdAt).toLocaleDateString("no-NO")}
                  </div>
                  <div className="smallHelp">{new Date(h.deletedAt ?? 0).toLocaleDateString("no-NO")}</div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={h.imageDataUrl}
                    alt=""
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      objectFit: "cover"
                    }}
                  />
                  <div className="smallHelp" style={{ flex: 1 }}>
                    {h.comment ? h.comment : "— Ingen kommentar —"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button
                    className="flatBtn"
                    onClick={() => doRestore(h.id, h.deletedFromLifeId ?? h.lifeId)}
                  >
                    Gjenopprett (original)
                  </button>
                  <button className="flatBtn" onClick={() => doRestore(h.id, "private")}>
                    Til Privat
                  </button>
                  <button className="flatBtn" onClick={() => doRestore(h.id, "work")}>
                    Til Jobb
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modalActions">
          {items.length > 0 ? (
            <button className="flatBtn danger" onClick={doEmpty}>
              Tøm papirkurv
            </button>
          ) : null}
          <button className="flatBtn" onClick={onClose}>
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
