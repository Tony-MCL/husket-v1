// ===============================
// src/screens/CategoryConfigScreen.tsx
// Settings screen (overlay) for selecting which categories are available in Capture.
// - Product-defined categories (icon + name)
// - User chooses 0..4 per life
// - Pro-locked categories are visible but disabled (paywall hook)
//
// v0.2.10
// ===============================
import React, { useMemo, useState } from "react";
import type { LifeId } from "../domain/types";
import { CATEGORY_CATALOG } from "../domain/catalog";
import { getCaptureCategoryIds, setCaptureCategoryIds } from "../data/capturePrefsRepo";

type Props = {
  lifeId: LifeId;
  onClose: () => void;
  onToast: (msg: string) => void;

  // Paywall hook (Core v1: false)
  hasPro?: boolean;
};

export function CategoryConfigScreen({ lifeId, onClose, onToast, hasPro = false }: Props) {
  const initial = useMemo(() => getCaptureCategoryIds(lifeId), [lifeId]);
  const [selected, setSelected] = useState<string[]>(initial);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const maxReached = selected.length >= 4;

  const toggle = (id: string, locked: boolean) => {
    if (locked) {
      onToast("Denne kategorien krever Pro (kommer senere).");
      return;
    }

    if (selectedSet.has(id)) {
      setSelected((prev) => prev.filter((x) => x !== id));
      return;
    }

    if (maxReached) {
      onToast("Du kan maks velge 4 kategorier.");
      return;
    }

    setSelected((prev) => [...prev, id].slice(0, 4));
  };

  const save = () => {
    setCaptureCategoryIds(lifeId, selected);
    onToast("Kategorier oppdatert.");
    onClose();
  };

  const clear = () => {
    setSelected([]);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Kategorier på Capture</h3>

        <div className="smallHelp" style={{ marginTop: 6 }}>
          Velg 0–4 kategorier som skal vises i Capture for dette livet.
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {CATEGORY_CATALOG.map((c) => {
            const locked = !!c.requiresPro && !hasPro;
            const active = selectedSet.has(c.id);

            return (
              <button
                key={c.id}
                type="button"
                className="flatBtn"
                onClick={() => toggle(c.id, locked)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  opacity: locked ? 0.55 : 1
                }}
                title={locked ? "Krever Pro" : "Velg"}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontWeight: 800 }}>{c.name}</span>
                  {locked ? (
                    <span
                      className="badge"
                      style={{
                        marginLeft: 8,
                        opacity: 0.9
                      }}
                    >
                      PRO
                    </span>
                  ) : null}
                </span>

                <span style={{ fontWeight: 900 }}>{active ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>

        <div className="smallHelp" style={{ marginTop: 10 }}>
          Valgt: {selected.length}/4
        </div>

        <div className="modalActions">
          <button className="flatBtn" onClick={onClose}>
            Lukk
          </button>
          <button className="flatBtn" onClick={clear}>
            Fjern alle
          </button>
          <button className="flatBtn primary" onClick={save}>
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}
