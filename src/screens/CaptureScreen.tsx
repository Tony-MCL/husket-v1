// ===============================
// src/screens/CaptureScreen.tsx
// Minimal v1 capture skeleton (no camera yet)
// Next pakke: real camera preview, overlay rating/kategori, save flow.
// ===============================
import React, { useMemo, useState } from "react";
import { useUiStore } from "../state/uiStore";
import type { Husket } from "../domain/types";
import { upsert } from "../data/husketRepo";

function uuid(): string {
  // Simple uuid v4-ish (offline). Good enough for core skeleton.
  const s = crypto.getRandomValues(new Uint8Array(16));
  s[6] = (s[6] & 0x0f) | 0x40;
  s[8] = (s[8] & 0x3f) | 0x80;
  const b = [...s].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${b.slice(0, 8)}-${b.slice(8, 12)}-${b.slice(12, 16)}-${b.slice(16, 20)}-${b.slice(20)}`;
}

export function CaptureScreen(props: { onToast: (msg: string) => void }) {
  const { onToast } = props;

  const activeLifeId = useUiStore((s) => s.activeLifeId);
  const goToPanel = useUiStore((s) => s.goToPanel);

  const [comment, setComment] = useState("");
  const [demoImg, setDemoImg] = useState<string | null>(null);

  const remaining = useMemo(() => 100 - comment.trim().length, [comment]);

  if (!activeLifeId) return <div className="appShell">Ingen aktivt liv.</div>;

  const saveDemo = () => {
    const trimmed = comment.trim();
    if (trimmed.length > 100) {
      onToast("Kommentar kan maks være 100 tegn.");
      return;
    }
    if (!demoImg) {
      onToast("Velg et demo-bilde (placeholder).");
      return;
    }

    const now = Date.now();
    const item: Husket = {
      id: uuid(),
      lifeId: activeLifeId,
      createdAt: now,
      comment: trimmed || undefined,
      imageMeta: { mime: "image/png", width: 800, height: 800 },
      imageDataUrl: demoImg
    };

    upsert(item);
    setComment("");
    setDemoImg(null);
    onToast("Lagret husk’et (demo).");
    goToPanel("album");
  };

  return (
    <div className="appShell" style={{ paddingTop: 74 }}>
      <div className="captureFrame">
        <div className="capturePreview">
          {demoImg ? <img src={demoImg} alt="" /> : <div>Preview (kamera kommer i neste pakke)</div>}
        </div>
      </div>

      <div className="label">Demo-bilde</div>
      <div className="ratingRow">
        <button
          className={`pill ${demoImg ? "active" : ""}`}
          onClick={() => {
            // Small embedded placeholder image: simple gradient via SVG data-url
            const svg =
              `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">` +
              `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
              `<stop offset="0" stop-color="#d7c2a8"/><stop offset="1" stop-color="#fffaf4"/>` +
              `</linearGradient></defs>` +
              `<rect width="800" height="800" fill="url(#g)"/>` +
              `<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="42" fill="#1b1a17">husk’et</text>` +
              `</svg>`;
            setDemoImg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
          }}
        >
          Velg placeholder
        </button>

        <button className="pill" onClick={() => setDemoImg(null)}>
          Fjern
        </button>
      </div>

      <div className="label">Kommentar (valgfri)</div>
      <textarea
        className="textarea"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={140} // hard cap (we validate to 100 anyway)
        placeholder="Skriv en kort kommentar (maks 100 tegn)"
      />
      <div className="smallHelp" style={{ marginTop: 6 }}>
        {remaining >= 0 ? `${remaining} tegn igjen` : "For lang kommentar"}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="flatBtn primary" onClick={saveDemo}>
          Lagre
        </button>
        <button className="flatBtn" onClick={() => goToPanel("album")}>
          Tilbake
        </button>
      </div>
    </div>
  );
}
