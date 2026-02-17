// ===============================
// src/data/local.ts
// ===============================
import type { LifeId } from "../domain/types";

const KEY_ACTIVE_LIFE = "husket.activeLifeId";
const KEY_ONBOARD_HINT = "husket.onboarding.panelHintCount";

export function loadActiveLifeId(): LifeId | null {
  const raw = localStorage.getItem(KEY_ACTIVE_LIFE);
  if (!raw) return null;
  if (raw === "private" || raw === "work" || raw === "custom1" || raw === "custom2") return raw;
  return null;
}

export function saveActiveLifeId(lifeId: LifeId) {
  localStorage.setItem(KEY_ACTIVE_LIFE, lifeId);
}

export function loadPanelHintCount(): number {
  const raw = localStorage.getItem(KEY_ONBOARD_HINT);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function savePanelHintCount(n: number) {
  localStorage.setItem(KEY_ONBOARD_HINT, String(Math.max(0, Math.floor(n))));
}
