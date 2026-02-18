// ===============================
// src/components/HusketSwipeDeck.tsx
// Viewer bunke + swipe (Framer Motion)
//
// HARD FIX for mobile ghost/tap-through:
// 1) Fullscreen overlay gets max z-index so nothing can sit above (TopBar/hamburger).
// 2) When closing fullscreen, we install a short-lived GLOBAL capture-phase event blocker
//    (document addEventListener with capture:true) that swallows pointerup/touchend/click.
//    This prevents the synthetic "next click" from landing on underlying UI.
// ===============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import type { Husket } from "../domain/types";

type Props = {
  items: Husket[];
  index: number;

  onSetIndex: (nextIndex: number) => void;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDeleteCurrent: () => void;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("no-NO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HusketSwipeDeck({ items, index, onSetIndex, onClose, onToggleFavorite, onDeleteCurrent }: Props) {
  const cur = items[index];
  const canOlder = index < items.length - 1;
  const canNewer = index > 0;

  const controls = useAnimation();
  const [showUnder, setShowUnder] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  // Global shield timer
  const shieldTimerRef = useRef<number | null>(null);
  const shieldActiveRef = useRef(false);

  const underIndex = useMemo(() => {
    if (canOlder) return index + 1;
    if (canNewer) return index - 1;
    return null;
  }, [index, canOlder, canNewer]);

  const underItem = underIndex != null ? items[underIndex] : null;

  useEffect(() => {
    setFullOpen(false);
    setShowUnder(false);
    controls.set({ x: 0, rotate: 0 });
  }, [cur?.id, controls]);

  useEffect(() => {
    return () => {
      if (shieldTimerRef.current != null) {
        window.clearTimeout(shieldTimerRef.current);
        shieldTimerRef.current = null;
      }
      uninstallGlobalBlocker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockerHandler = (e: Event) => {
    if (!shieldActiveRef.current) return;
    try {
      e.preventDefault();
    } catch {
      // ignore
    }
    try {
      const anyEvent = e as unknown as { stopImmediatePropagation?: () => void };
      anyEvent.stopImmediatePropagation?.();
    } catch {
      // ignore
    }
    try {
      e.stopPropagation();
    } catch {
      // ignore
    }
  };

  const installGlobalBlocker = () => {
    // Capture-phase: runs before React + before underlying elements
    document.addEventListener("pointerup", blockerHandler, true);
    document.addEventListener("pointerdown", blockerHandler, true);
    document.addEventListener("click", blockerHandler, true);
    document.addEventListener("touchend", blockerHandler, true);
    document.addEventListener("touchstart", blockerHandler, true);
  };

  const uninstallGlobalBlocker = () => {
    document.removeEventListener("pointerup", blockerHandler, true);
    document.removeEventListener("pointerdown", blockerHandler, true);
    document.removeEventListener("click", blockerHandler, true);
    document.removeEventListener("touchend", blockerHandler, true);
    document.removeEventListener("touchstart", blockerHandler, true);
  };

  const armGlobalShield = (ms: number) => {
    shieldActiveRef.current = true;
    installGlobalBlocker();

    if (shieldTimerRef.current != null) {
      window.clearTimeout(shieldTimerRef.current);
      shieldTimerRef.current = null;
    }

    shieldTimerRef.current = window.setTimeout(() => {
      shieldActiveRef.current = false;
      uninstallGlobalBlocker();
      shieldTimerRef.current = null;
    }, ms);
  };

  const closeFullscreenHard = () => {
    // Shield must be armed BEFORE unmount to catch the synthetic follow-up click.
    armGlobalShield(400);
    setFullOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fullOpen) {
        closeFullscreenHard();
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullOpen, onClose]);

  const commitSwipe = async (dir: "left" | "right") => {
    if (fullOpen) return;

    setShowUnder(true);

    const w = Math.max(window.innerWidth || 360, 360);
    const exitX = dir === "left" ? -w : w;

    await controls.start({
      x: exitX,
      rotate: dir === "left" ? -6 : 6,
      transition: { type: "spring", stiffness: 420, damping: 34 },
    });

    if (dir === "left" && canOlder) onSetIndex(index + 1);
    if (dir === "right" && canNewer) onSetIndex(index - 1);

    controls.set({ x: 0, rotate: 0 });
    setShowUnder(false);
  };

  const goOlderAnimated = async () => {
    if (!canOlder) return;
    await commitSwipe("left");
  };

  const goNewerAnimated = async () => {
    if (!canNewer) return;
    await commitSwipe("right");
  };

  if (!cur) return null;

  const underVisible = showUnder && !fullOpen;

  const wrap: React.CSSProperties = {
    position: "relative",
    height: "100%",
    display: "grid",
    placeItems: "center",
    padding: "0 12px",
    isolation: "isolate",
  };

  const cardBase = (maxW: number): React.CSSProperties => ({
    width: "100%",
    maxWidth: maxW,
    borderRadius: 22,
    overflow: "hidden",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.10)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    display: "grid",
    gridTemplateRows: "auto auto",
    position: "relative",
  });

  const imageFrame: React.CSSProperties = {
    padding: 12,
    display: "grid",
    placeItems: "center",
  };

  const imageShell: React.CSSProperties = {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(0,0,0,0.06)",
    maxHeight: "min(58vh, 520px)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  };

  const meta: React.CSSProperties = {
    padding: "12px 14px 12px",
    display: "grid",
    gap: 10,
  };

  const topBtns: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };

  const arrowBtn = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 8,
    pointerEvents: "auto",
    border: "none",
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(8px)",
    borderRadius: 14,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
  });

  const chip: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    color: "rgba(0,0,0,0.70)",
    fontSize: 13,
    whiteSpace: "nowrap",
  };

  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  };

  const actionRow: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 10,
    paddingTop: 2,
    borderTop: "1px solid rgba(0,0,0,0.08)",
    marginTop: 6,
  };

  const actionBtn: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: 14,
  };

  const dangerBtn: React.CSSProperties = {
    ...actionBtn,
    color: "rgba(190, 40, 40, 0.95)",
    justifySelf: "start",
  };

  const closeBtn: React.CSSProperties = {
    ...actionBtn,
    justifySelf: "end",
  };

  // Max z-index to beat any app chrome (TopBar/SettingsDrawer/etc.)
  const fullOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483647,
    background: "rgba(0,0,0,0.92)",
    display: "grid",
    gridTemplateRows: "auto 1fr",
    padding: "10px 10px calc(10px + env(safe-area-inset-bottom))",
    touchAction: "none",
  };

  const fullTop: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  };

  const fullClose: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 800,
  };

  const fullImgWrap: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
  };

  const fullImg: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    display: "block",
  };

  return (
    <div style={wrap}>
      {/* Under card (peek only while dragging) */}
      {underItem ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            opacity: underVisible ? 0.92 : 0,
            transform: underVisible ? "scale(0.975)" : "scale(1)",
            transition: "opacity 140ms ease, transform 140ms ease",
          }}
        >
          <div style={cardBase(520 - 18)}>
            <div style={imageFrame}>
              <div style={{ ...imageShell, cursor: "default" }}>
                <img src={underItem.imageDataUrl} alt="" style={imgStyle} />
              </div>
            </div>
            <div style={meta}>
              <div style={{ ...chip, color: "rgba(0,0,0,0.72)" }}>
                Husket øyeblikk: {formatDate(underItem.createdAt)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Fullscreen photo */}
      {fullOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={fullOverlay}
          // Eat events while fullscreen is open
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div style={fullTop} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={fullClose}
              // Close on pointerdown/touchstart so we beat delayed click sequences
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeFullscreenHard();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeFullscreenHard();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Lukk fullskjerm"
              title="Lukk"
            >
              ✕
            </button>

            <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
              {index + 1}/{items.length}
            </div>
          </div>

          <div style={fullImgWrap} onClick={(e) => e.stopPropagation()}>
            <img src={cur.imageDataUrl} alt="" style={fullImg} />
          </div>
        </div>
      ) : null}

      {/* Top (swipe) card */}
      <motion.div
        style={cardBase(520)}
        drag={fullOpen ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        animate={controls}
        onDragStart={() => {
          if (fullOpen) return;
          setShowUnder(true);
        }}
        onDrag={(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
          if (fullOpen) return;
          const w = Math.max(window.innerWidth || 360, 360);
          const p = clamp(info.offset.x / w, -1, 1);
          controls.set({ rotate: p * 6 });
        }}
        onDragEnd={async (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
          if (fullOpen) return;

          const dx = info.offset.x;
          const w = Math.max(window.innerWidth || 360, 360);
          const threshold = Math.max(90, w * 0.22);

          if (dx < -threshold && canOlder) {
            await commitSwipe("left");
            return;
          }

          if (dx > threshold && canNewer) {
            await commitSwipe("right");
            return;
          }

          await controls.start({
            x: 0,
            rotate: 0,
            transition: { type: "spring", stiffness: 520, damping: 36 },
          });

          setShowUnder(false);
        }}
      >
        {/* Arrow overlay (buttons, always possible without swipe) */}
        <div style={topBtns}>
          {canNewer ? (
            <button type="button" onClick={() => void goNewerAnimated()} style={arrowBtn("left")} aria-label="Nyere">
              ◀
            </button>
          ) : null}
          {canOlder ? (
            <button type="button" onClick={() => void goOlderAnimated()} style={arrowBtn("right")} aria-label="Eldre">
              ▶
            </button>
          ) : null}
        </div>

        {/* Image (tap => fullscreen) */}
        <div style={imageFrame}>
          <div
            style={imageShell}
            onClick={(e) => {
              e.stopPropagation();
              setFullOpen(true);
            }}
            role="button"
            aria-label="Åpne bilde i fullskjerm"
          >
            <img src={cur.imageDataUrl} alt="" style={imgStyle} />
          </div>
        </div>

        {/* Meta */}
        <div style={meta}>
          <div style={{ ...chip, color: "rgba(0,0,0,0.72)" }}>Husket øyeblikk: {formatDate(cur.createdAt)}</div>

          {cur.comment ? (
            <div style={{ color: "rgba(0,0,0,0.86)", whiteSpace: "pre-wrap" }}>{cur.comment}</div>
          ) : (
            <div style={{ color: "rgba(0,0,0,0.45)" }}>— Ingen kommentar —</div>
          )}

          <div style={row}>
            <span style={chip}>{cur.isFavorite ? "★ Favoritt" : "—"}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={{ ...actionBtn, padding: 0, fontWeight: 700 }}
            >
              {cur.isFavorite ? "Fjern favoritt" : "Gjør til favoritt"}
            </button>
          </div>

          <div style={actionRow}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCurrent();
              }}
              style={dangerBtn}
              title="Slett"
            >
              🗑 Slett
            </button>

            <div style={{ justifySelf: "center", color: "rgba(0,0,0,0.55)", fontSize: 13 }}>
              {index + 1}/{items.length}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={closeBtn}
              title="Lukk"
            >
              ✕ Lukk
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
