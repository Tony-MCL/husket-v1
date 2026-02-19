// ===============================
// src/screens/CaptureScreen.tsx
// Core v1: minimal "create husk'et" to validate flow (offline).
// Camera integration comes later.
//
// v0.2.9:
// - Category selection moved to reusable OptionPickerModal
// - Capture UI now matches how Ratings will work later
// ===============================
import React, { useMemo, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { makeId } from "../domain/id";
import type { Husket } from "../domain/types";
import { listByLife, upsert } from "../data/husketRepo";
import { OptionPickerModal } from "../components/OptionPickerModal";

function makeDemoImageDataUrl(label: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d9c6a6"/>
        <stop offset="1" stop-color="#cbb79a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="40" y="40" width="820" height="820" rx="40" fill="rgba(255,255,255,0.25)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="64"
      fill="rgba(0,0,0,0.55)" font-weight="700">${label}</text>
  </svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function uniqSorted(values: Array<string | undefined>): string[] {
  const s = new Set<string>();
  for (const v of values) if (typeof v === "string" && v.trim()) s.add(v.trim());
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

export function CaptureScreen(props: { onToast: (msg: string) => void }) {
  const { onToast } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const goToPanel = useUiStore((s) => s.goToPanel);

  const [comment, setComment] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [catOpen, setCatOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    if (!activeLifeId) return [];
    const items = listByLife(activeLifeId, false);
    return uniqSorted(items.map((x) => x.categoryId));
  }, [activeLifeId]);

  const canSave = useMemo(() => {
    if (!activeLifeId) return false;
    return comment.trim().length <= 100;
  }, [activeLifeId, comment]);

  const saveDemo = () => {
    if (!activeLifeId) return;

    const trimmed = comment.trim();
    if (trimmed.length > 100) {
      onToast("Kommentaren kan maks være 100 tegn.");
      return;
    }

    const now = Date.now();
    const id = makeId();

    const item: Husket = {
      id,
      lifeId: activeLifeId,
      createdAt: now,
      comment: trimmed ? trimmed : undefined,
      categoryId: categoryId?.trim() ? categoryId.trim() : undefined,

      imageMeta: {
        mime: "image/svg+xml",
        width: 900,
        height: 900
      },
      imageDataUrl: makeDemoImageDataUrl("husk’et")
    };

    upsert(item);

    setComment("");
    setCategoryId(undefined);
    onToast("Lagret husk’et.");
    goToPanel("album");
  };

  return (
    <div className="appShell" style={{ paddingTop: 74 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 14px" }}>
        <div className="smallHelp" style={{ marginBottom: 10 }}>
          Midlertidig Capture (demo): Dette lager ekte husk’eter offline slik at Album + Viewer kan testes.
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 18,
            overflow: "hidden",
            background: "rgba(0,0,0,0.03)"
          }}
        >
          <img
            src={makeDemoImageDataUrl("husk’et")}
            alt=""
            style={{ width: "100%", display: "block", aspectRatio: "1 / 1", objectFit: "cover" }}
          />
        </div>

        {/* Category (optional) */}
        <div style={{ marginTop: 12 }}>
          <div className="label">Kategori (valgfri)</div>

          <button
            type="button"
            className="flatBtn"
            onClick={() => setCatOpen(true)}
            style={{ width: "100%", textAlign: "left" }}
          >
            {categoryId ? `🏷 ${categoryId}` : "🏷 Ingen kategori"}
          </button>

          <div className="smallHelp" style={{ marginTop: 6 }}>
            {categoryId ? "Trykk for å endre eller fjerne." : "Trykk for å velge eller opprette."}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginTop: 12 }}>
          <div className="label">Kommentar (valgfri, maks 100)</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Skriv en kort kommentar…"
            style={{
              width: "100%",
              borderRadius: 14,
              border: "1px solid var(--line)",
              padding: 12,
              fontSize: 16,
              resize: "vertical"
            }}
          />
          <div className="smallHelp" style={{ marginTop: 6 }}>
            {comment.trim().length}/100
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="flatBtn" onClick={() => goToPanel("album")}>
            Tilbake
          </button>

          <button className="flatBtn primary" onClick={saveDemo} disabled={!canSave}>
            Lagre
          </button>
        </div>
      </div>

      {catOpen ? (
        <OptionPickerModal
          title="Kategori"
          options={categoryOptions}
          value={categoryId}
          allowCustom={true}
          inputPlaceholder="Skriv ny kategori…"
          inputMaxLength={32}
          saveLabel="Lagre"
          clearLabel="Fjern"
          closeLabel="Lukk"
          onSave={(v) => setCategoryId(v)}
          onClose={() => setCatOpen(false)}
        />
      ) : null}
    </div>
  );
}
