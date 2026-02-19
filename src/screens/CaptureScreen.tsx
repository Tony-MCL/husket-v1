// ===============================
// src/screens/CaptureScreen.tsx
// Core v1: minimal "create husk'et" to validate flow (offline).
// Camera integration comes later.
//
// v0.2.10:
// - Categories are product-defined
// - Capture shows up to 4 category buttons chosen in Settings (per life)
// - User cannot create categories in Capture
// ===============================
import React, { useMemo, useState } from "react";
import { useUiStore } from "../state/uiStore";
import { makeId } from "../domain/id";
import type { Husket } from "../domain/types";
import { upsert } from "../data/husketRepo";
import { getCaptureCategoryIds } from "../data/capturePrefsRepo";
import { getCategoryById } from "../domain/catalog";

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

export function CaptureScreen(props: { onToast: (msg: string) => void }) {
  const { onToast } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const goToPanel = useUiStore((s) => s.goToPanel);

  const [comment, setComment] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const captureCategoryIds = useMemo(() => {
    if (!activeLifeId) return [];
    return getCaptureCategoryIds(activeLifeId);
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
      categoryId: categoryId ? categoryId : undefined,

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

        {/* Categories (0..4) */}
        <div style={{ marginTop: 12 }}>
          <div className="label">Kategori (valgfri)</div>

          {captureCategoryIds.length === 0 ? (
            <div className="smallHelp" style={{ marginTop: 6 }}>
              Ingen kategorier valgt for Capture i dette livet. (Velges i Settings.)
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              {captureCategoryIds.map((id) => {
                const def = getCategoryById(id);
                if (!def) return null;

                const active = categoryId === id;

                return (
                  <button
                    key={id}
                    type="button"
                    className={`pill ${active ? "active" : ""}`}
                    onClick={() => setCategoryId((prev) => (prev === id ? undefined : id))}
                    title="Velg kategori"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>{def.icon}</span>
                    <span>{def.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="smallHelp" style={{ marginTop: 8 }}>
            {categoryId ? `Valgt: ${getCategoryById(categoryId)?.name ?? "—"}` : "Ingen kategori valgt."}
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
    </div>
  );
}
