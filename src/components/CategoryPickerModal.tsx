// ===============================
// src/components/CategoryPickerModal.tsx
// Viewer category picker (NO custom input).
// - Uses app-defined categories (icon + name)
// - Calls back with selected categoryId (or undefined to clear)
// - Hard z-index so it always sits above viewer deck
//
// v0.2.14
// ===============================
import React, { useMemo } from "react";
import { CATEGORIES } from "../domain/categories";

type Props = {
  currentCategoryId?: string;
  onPick: (categoryId?: string) => void;
  onClose: () => void;
};

export function CategoryPickerModal({ currentCategoryId, onPick, onClose }: Props) {
  const items = useMemo(() => CATEGORIES, []);

  return (
    <div
      className="modalOverlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000000,
        pointerEvents: "auto"
      }}
      onClick={onClose}
    >
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">Kategori</h3>

        <div className="smallHelp" style={{ marginTop: 6 }}>
          Velg en kategori (app-definert). Ingen egendefinerte navn i Core v1.
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <button
            className="flatBtn"
            onClick={() => {
              onPick(undefined);
              onClose();
            }}
          >
            Fjern kategori
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10
            }}
          >
            {items.map((c) => {
              const active = c.id === currentCategoryId;
              return (
                <button
                  key={c.id}
                  className={`flatBtn ${active ? "primary" : ""}`}
                  onClick={() => {
                    onPick(c.id);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "flex-start"
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontWeight: 800 }}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modalActions">
          <button className="flatBtn" onClick={onClose}>
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
