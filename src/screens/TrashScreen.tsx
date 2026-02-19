// ===============================
// src/screens/TrashScreen.tsx
// Global trash – visible from Album + Settings
//
// v0.2.5:
// - Compact thumbnail grid (3-4+ per row)
// - Multi-select via checkbox overlay on each thumbnail
// - ONE set of action buttons (not per item)
// - Optional target picker (single choice) before restore
// - No duplicate "Papirkurven er tom."
// - Auto-close when trash becomes empty
// - Subscribe to repo writes so list updates immediately
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { emptyTrash, listTrash, restoreFromTrash, subscribeRepo } from "../data/husketRepo";
import type { LifeId, Husket } from "../domain/types";

function isLifeActiveCoreV1(lifeId: LifeId): boolean {
  return lifeId === "private" || lifeId === "work";
}

function resolveOriginalRestoreTargetCoreV1(item: { deletedFromLifeId?: LifeId; lifeId: LifeId }): LifeId {
  const original = item.deletedFromLifeId ?? item.lifeId;
  return isLifeActiveCoreV1(original) ? original : "private";
}

type RestoreTarget = "original" | "private" | "work";

export function TrashScreen(props: { onClose: () => void; onToast: (msg: string) => void }) {
  const { onClose, onToast } = props;

  const [repoTick, setRepoTick] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<RestoreTarget>("original");

  useEffect(() => {
    const unsub = subscribeRepo(() => setRepoTick((x) => x + 1));
    return unsub;
  }, []);

  const items: Husket[] = useMemo(() => {
    void repoTick;
    return listTrash();
  }, [repoTick]);

  // Auto-close when empty (including immediately on open)
  useEffect(() => {
    if (items.length === 0) {
      onClose();
    }
  }, [items.length, onClose]);

  // Keep selection clean when items disappear from trash
  useEffect(() => {
    if (items.length === 0) {
      if (Object.keys(selectedIds).length > 0) setSelectedIds({});
      return;
    }

    const inTrash = new Set(items.map((x) => x.id));
    const next: Record<string, true> = {};
    let changed = false;

    for (const id of Object.keys(selectedIds)) {
      if (inTrash.has(id)) next[id] = true;
      else changed = true;
    }

    if (changed) setSelectedIds(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((x) => x.id).join("|")]);

  const selectedCount = Object.keys(selectedIds).length;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: true };
    });
  };

  const clearSelection = () => setSelectedIds({});

  const selectAll = () => {
    const next: Record<string, true> = {};
    for (const h of items) next[h.id] = true;
    setSelectedIds(next);
  };

  const doEmpty = () => {
    const ok = window.confirm("Tøm papirkurv permanent?");
    if (!ok) return;
    emptyTrash();
    clearSelection();
    onToast("Papirkurv tømt.");
    // Auto-close handled by effect when items becomes empty
  };

  const openRestorePicker = () => {
    if (selectedCount <= 0) {
      onToast("Velg minst ett husk’et først.");
      return;
    }
    setRestoreTarget("original");
    setPickerOpen(true);
  };

  const confirmRestore = () => {
    if (selectedCount <= 0) {
      setPickerOpen(false);
      return;
    }

    let restored = 0;

    for (const h of items) {
      if (!selectedIds[h.id]) continue;

      const targetLifeId: LifeId =
        restoreTarget === "original"
          ? resolveOriginalRestoreTargetCoreV1(h)
          : restoreTarget;

      restoreFromTrash(h.id, targetLifeId);
      restored += 1;
    }

    clearSelection();
    setPickerOpen(false);
    onToast(`Gjenopprettet ${restored} stk.`);
    // Auto-close will happen if trash became empty
  };

  // If auto-close will trigger, avoid rendering flashy UI
  if (items.length === 0) return null;

  const gridWrap: React.CSSProperties = {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))",
    alignItems: "start",
  };

  const tile: React.CSSProperties = {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid var(--line)",
    background: "rgba(255,255,255,0.7)",
  };

  const checkboxWrap: React.CSSProperties = {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 2,
    background: "rgba(255,255,255,0.85)",
    borderRadius: 10,
    padding: "4px 6px",
    border: "1px solid rgba(0,0,0,0.08)",
    backdropFilter: "blur(6px)",
  };

  const thumbImg: React.CSSProperties = {
    width: "100%",
    height: 86,
    objectFit: "cover",
    display: "block",
  };

  const smallRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 10,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Papirkurv</h3>

        {/* Header row (info + selection controls) */}
        <div style={smallRow}>
          <div className="smallHelp">
            {selectedCount > 0 ? `Valgt: ${selectedCount}` : `Elementer: ${items.length}`}
          </div>

          <div style={btnRow}>
            {items.length > 0 ? (
              <>
                <button className="flatBtn" onClick={selectedCount === items.length ? clearSelection : selectAll}>
                  {selectedCount === items.length ? "Fjern alle valg" : "Velg alle"}
                </button>

                <button className="flatBtn" onClick={openRestorePicker}>
                  Gjenopprett…
                </button>

                <button className="flatBtn danger" onClick={doEmpty}>
                  Tøm papirkurv
                </button>
              </>
            ) : null}

            <button className="flatBtn" onClick={onClose}>
              Lukk
            </button>
          </div>
        </div>

        {/* Thumbnail grid */}
        <div style={gridWrap}>
          {items.map((h) => {
            const isSelected = !!selectedIds[h.id];
            const title = [
              `Slettet: ${new Date(h.deletedAt ?? 0).toLocaleString("no-NO")}`,
              `Opprettet: ${new Date(h.createdAt).toLocaleString("no-NO")}`,
              h.comment ? `Kommentar: ${h.comment}` : "Ingen kommentar",
            ].join("\n");

            return (
              <div key={h.id} style={tile} title={title}>
                <div style={checkboxWrap}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(h.id)}
                    aria-label="Velg"
                  />
                </div>

                <img src={h.imageDataUrl} alt="" style={thumbImg} />
              </div>
            );
          })}
        </div>

        {/* Restore target picker (single choice) */}
        {pickerOpen ? (
          <div
            className="modalOverlay"
            style={{ position: "fixed", inset: 0, zIndex: 1000001, pointerEvents: "auto" }}
            onClick={() => setPickerOpen(false)}
          >
            <div className="modalBox" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <h3 className="modalTitle">Gjenopprett til</h3>

              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="restoreTarget"
                    checked={restoreTarget === "original"}
                    onChange={() => setRestoreTarget("original")}
                  />
                  <div>
                    <div style={{ fontWeight: 800 }}>Originalt liv</div>
                    <div className="smallHelp">Hvis originalt liv ikke er aktivt, legges det i Privat.</div>
                  </div>
                </label>

                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="restoreTarget"
                    checked={restoreTarget === "private"}
                    onChange={() => setRestoreTarget("private")}
                  />
                  <div style={{ fontWeight: 800 }}>Privat</div>
                </label>

                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="restoreTarget"
                    checked={restoreTarget === "work"}
                    onChange={() => setRestoreTarget("work")}
                  />
                  <div style={{ fontWeight: 800 }}>Jobb</div>
                </label>
              </div>

              <div className="modalActions">
                <button className="flatBtn" onClick={() => setPickerOpen(false)}>
                  Avbryt
                </button>
                <button className="flatBtn primary" onClick={confirmRestore}>
                  Gjenopprett
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
