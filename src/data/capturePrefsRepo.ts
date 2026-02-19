// ===============================
// src/data/capturePrefsRepo.ts
// Stores user preferences for which product-defined options are shown in Capture.
// - Categories: 0..4 per life
// - Ratings: later (same pattern)
//
// v0.2.10
// ===============================
import type { LifeId } from "../domain/types";

const KEY = "husket.core.capturePrefs.v1";

export type CapturePrefs = {
  version: 1;
  categoriesByLife: Partial<Record<LifeId, string[]>>;
  ratingsByLife: Partial<Record<LifeId, string[]>>;
};

const DEFAULT_PREFS: CapturePrefs = {
  version: 1,
  categoriesByLife: {},
  ratingsByLife: {}
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function read(): CapturePrefs {
  const parsed = safeParse<CapturePrefs>(localStorage.getItem(KEY));
  if (!parsed || parsed.version !== 1) return { ...DEFAULT_PREFS };
  return {
    ...DEFAULT_PREFS,
    ...parsed,
    categoriesByLife: { ...DEFAULT_PREFS.categoriesByLife, ...(parsed.categoriesByLife ?? {}) },
    ratingsByLife: { ...DEFAULT_PREFS.ratingsByLife, ...(parsed.ratingsByLife ?? {}) }
  };
}

function write(prefs: CapturePrefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

export function getCaptureCategoryIds(lifeId: LifeId): string[] {
  const prefs = read();
  const list = prefs.categoriesByLife[lifeId] ?? [];
  return Array.isArray(list) ? list.slice(0, 4) : [];
}

export function setCaptureCategoryIds(lifeId: LifeId, ids: string[]) {
  const prefs = read();
  prefs.categoriesByLife = {
    ...prefs.categoriesByLife,
    [lifeId]: (Array.isArray(ids) ? ids : []).slice(0, 4)
  };
  write(prefs);
}

// Rating hooks for later
export function getCaptureRatingIds(lifeId: LifeId): string[] {
  const prefs = read();
  const list = prefs.ratingsByLife[lifeId] ?? [];
  return Array.isArray(list) ? list.slice(0, 12) : [];
}

export function setCaptureRatingIds(lifeId: LifeId, ids: string[]) {
  const prefs = read();
  prefs.ratingsByLife = {
    ...prefs.ratingsByLife,
    [lifeId]: (Array.isArray(ids) ? ids : []).slice(0, 12)
  };
  write(prefs);
}
