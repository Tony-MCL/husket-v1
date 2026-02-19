// ===============================
// src/screens/TrashScreen.tsx
// Global trash – visible from Album + Settings
// v0.2.4:
// - Keep trash open after restore (close only via "Lukk")
// - Multi-select restore (restore many at once)
// - Subscribe to repo writes so list updates immediately
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { emptyTrash, listTrash, restoreFromTrash, subscribeRepo } from "../data/husketRepo";
import type { LifeId, Husket } from "../domain/types";

function labelForLife(lifeId: LifeId) {
  if (lifeId === "private") return "Privat";
  if (lifeId === "work") return "Jobb";
  if (lifeId === "custom1") return "Egendefinert 1";
  return "Egendefinert 2";
}

/**
 * Core v1: Only private/work are guaranteed active.
 * Custom lives are considered inactive until premium/life-admin exists.
 */
function isLifeActiveCoreV1(lifeId: LifeId): boolean {
  return lifeId === "private" || lifeId === "work";
}

function resolveOriginalRestoreTargetCoreV1(item: { deletedFromLifeId?: LifeId; lifeId: LifeId }): LifeId {
  const original = item.deletedFromLifeId ?? item.lifeId;
  return isLifeActiveCoreV1(original) ? original : "private";
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("no-NO");
}

export function TrashScreen(props: { onClose: () => void; onToast: (msg: string) => void }) {
  const { onClose, onToast } = props;

  const [repoTick, setRepoTick] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});

  useEffect(() => {
    const unsub = subscribeRepo(() => setRepoTick((x) => x + 1));
    return unsub;
  }, []);

  const items: Husket[] = useMemo(() => {
    // repoTick forces refresh when repo changes
    void repoTick;
    return listTrash();
  }, [repoTick]);

  // Clean up selections for items that no longer exist in trash
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

  const doEmpty = () => {
    const ok = window.confirm("Tøm papirkurv permanent?");
    if (!ok) return;
    emptyTrash();
    clearSelection();
    onToast("Papirkurv tømt.");
    // Keep trash open; user can press "Lukk"
  };

  const doRestoreOne = (id: string, toLifeId: LifeId) => {
    restoreFromTrash(id, toLifeId);
    onToast("Gjenopprettet.");
    // Keep open
  };

  const restoreMany = (toLifeId: LifeId | "original") => {
    if (selectedCount <= 0) {
      onToast("Velg minst ett husk’et først.");
      return;
    }

    let restored = 0;

    for (const h of items) {
      if (!selectedIds[h.id]) continue;

      const target =
        toLifeId === "original" ? resolveOriginalRestoreTargetCoreV1(h) : toLifeId;

      restoreFromTrash(h.id, target);
      restored += 1;
    }

    clearSelection();
    onToast(`Gjenopprettet ${restored} stk.`);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Papirkurv</h3>

        {/* Bulk actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
          <div className="smallHelp" style={{ flex: 1 }}>
            {items.length === 0
              ? "Papirkurven er tom."
              : selectedCount > 0
              ? `Valgt: ${selectedCount}`
              : "Velg flere for masse-gjenoppretting."}
          </div>

          {selectedCount > 0 ? (
            <>
              <button className="flatBtn" onClick={() => restoreMany("original")}>
                Gjenopprett valgt (original)
              </button>
              <button className="flatBtn" onClick={() => restoreMany("private")}>
                Til Privat
              </button>
              <button className="flatBtn" onClick={() => restoreMany("work")}>
                Til Jobb
              </button>
              <button className="flatBtn" onClick={clearSelection}>
                Nullstill valg
              </button>
            </>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="smallHelp">Papirkurven er tom.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((h) => {
              const originalTarget = resolveOriginalRestoreTargetCoreV1(h);
              const originalLabel = labelForLife(h.deletedFromLifeId ?? h.lifeId);
              const originalIsInactive = !isLifeActiveCoreV1(h.deletedFromLifeId ?? h.lifeId);
              const isSelected = !!selectedIds[h.id];

              return (
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
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(h.id)}
                      />
                      <div className="smallHelp">
                        {originalLabel}
                        {originalIsInactive ? " • (deaktivert → Privat)" : null}
                        {" • "}
                        {formatDate(h.createdAt)}
                      </div>
                    </label>

                    <div className="smallHelp">{formatDate(h.deletedAt)}</div>
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
                    <button className="flatBtn" onClick={() => doRestoreOne(h.id, originalTarget)}>
                      Gjenopprett (original)
                    </button>
                    <button className="flatBtn" onClick={() => doRestoreOne(h.id, "private")}>
                      Til Privat
                    </button>
                    <button className="flatBtn" onClick={() => doRestoreOne(h.id, "work")}>
                      Til Jobb
                    </button>
                  </div>
                </div>
              );
            })}
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
