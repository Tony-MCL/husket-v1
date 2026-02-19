// ===============================
// src/components/OptionPickerModal.tsx
// Generic single-select picker modal with optional "create new" input.
// Built to be reused for:
// - Category (editable)
// - Rating (select once in Capture; later: view-only in Viewer)
//
// v0.2.9
// ===============================
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  title: string;

  // options shown as pills
  options: string[];

  // current selected value
  value?: string;

  // optional input (create new)
  allowCustom?: boolean;
  inputPlaceholder?: string;
  inputMaxLength?: number;

  // button labels (keep simple, Norwegian now)
  saveLabel?: string;
  clearLabel?: string;
  closeLabel?: string;

  // actions
  onSave: (value?: string) => void;
  onClose: () => void;
};

function uniqSorted(options: string[]) {
  const s = new Set<string>();
  for (const o of options) {
    const v = (o ?? "").trim();
    if (v) s.add(v);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

export function OptionPickerModal({
  title,
  options,
  value,
  allowCustom = true,
  inputPlaceholder = "Skriv ny…",
  inputMaxLength = 32,
  saveLabel = "Lagre",
  clearLabel = "Fjern",
  closeLabel = "Lukk",
  onSave,
  onClose
}: Props) {
  const safeOptions = useMemo(() => uniqSorted(options), [options]);

  const [draft, setDraft] = useState<string>(value ?? "");
  const [typed, setTyped] = useState<string>("");

  useEffect(() => {
    setDraft(value ?? "");
    setTyped("");
  }, [value]);

  const canSave = useMemo(() => {
    const v = (draft || typed).trim();
    return v.length <= inputMaxLength;
  }, [draft, typed, inputMaxLength]);

  const effectiveValue = (draft || typed).trim();

  const commitSave = () => {
    const v = effectiveValue;
    onSave(v ? v : undefined);
    onClose();
  };

  const commitClear = () => {
    onSave(undefined);
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">{title}</h3>

        {safeOptions.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {safeOptions.map((opt) => {
              const active = (draft || "").trim() === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  className={`pill ${active ? "active" : ""}`}
                  onClick={() => {
                    setDraft(opt);
                    setTyped("");
                  }}
                  title="Velg"
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="smallHelp" style={{ marginTop: 10 }}>
            Ingen valg enda.
          </div>
        )}

        {allowCustom ? (
          <div style={{ marginTop: 12 }}>
            <div className="label">Ny</div>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={inputPlaceholder}
              maxLength={inputMaxLength}
              style={{
                width: "100%",
                borderRadius: 14,
                border: "1px solid var(--line)",
                padding: 12,
                fontSize: 16
              }}
            />
            <div className="smallHelp" style={{ marginTop: 6 }}>
              {effectiveValue ? `Valgt: ${effectiveValue}` : "Ingen valgt."}
            </div>
          </div>
        ) : (
          <div className="smallHelp" style={{ marginTop: 10 }}>
            {effectiveValue ? `Valgt: ${effectiveValue}` : "Ingen valgt."}
          </div>
        )}

        <div className="modalActions">
          <button className="flatBtn" onClick={onClose}>
            {closeLabel}
          </button>

          <div style={{ flex: 1 }} />

          <button className="flatBtn" onClick={commitClear}>
            {clearLabel}
          </button>

          <button className="flatBtn primary" onClick={commitSave} disabled={!canSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
