// ===============================
// src/domain/applyAlbumFilters.ts
// Single source of truth for album+viewer filtering.
// AND logic across all active filters.
//
// v0.2.6
// ===============================
import type { AlbumFilters, Husket } from "./types";

function startOfDayLocal(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDayLocal(ts: number): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function normalizeCustomRange(filters: AlbumFilters): { from?: number; to?: number } {
  if (filters.datePreset !== "custom") return {};
  const from = typeof filters.customFrom === "number" ? filters.customFrom : undefined;
  const to = typeof filters.customTo === "number" ? filters.customTo : undefined;
  if (from == null && to == null) return {};

  const nf = from != null ? startOfDayLocal(from) : undefined;
  const nt = to != null ? endOfDayLocal(to) : undefined;

  // If user accidentally swaps, fix it deterministically
  if (nf != null && nt != null && nf > nt) {
    return { from: nt, to: nf };
  }
  return { from: nf, to: nt };
}

function rollingWindowFromPreset(preset: "week" | "month" | "year"): { from: number; to: number } {
  const now = Date.now();
  const to = now;
  const days = preset === "week" ? 7 : preset === "month" ? 30 : 365;
  const from = now - days * 24 * 60 * 60 * 1000;
  return { from, to };
}

export function applyAlbumFilters(items: Husket[], filters: AlbumFilters): Husket[] {
  const f = filters ?? {};
  const hasAny =
    !!f.favoriteOnly ||
    !!f.categoryId ||
    !!f.ratingId ||
    (f.datePreset != null && f.datePreset !== undefined);

  if (!hasAny) return items;

  let out = items;

  if (f.favoriteOnly) {
    out = out.filter((x) => !!x.isFavorite);
  }

  if (f.categoryId) {
    out = out.filter((x) => x.categoryId === f.categoryId);
  }

  if (f.ratingId) {
    out = out.filter((x) => x.ratingId === f.ratingId);
  }

  if (f.datePreset && f.datePreset !== "custom") {
    const { from, to } = rollingWindowFromPreset(f.datePreset);
    out = out.filter((x) => x.createdAt >= from && x.createdAt <= to);
  }

  if (f.datePreset === "custom") {
    const { from, to } = normalizeCustomRange(f);
    if (from != null) out = out.filter((x) => x.createdAt >= from);
    if (to != null) out = out.filter((x) => x.createdAt <= to);
  }

  return out;
}
