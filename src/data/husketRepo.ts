// ===============================
// src/data/husketRepo.ts
// Core v1 storage: localStorage (simple + stable skeleton)
// Later: replace with IDB without touching UI contract.
// ===============================
import type { Husket, LifeId } from "../domain/types";

const KEY = "husket.core.items.v1";

/**
 * Core v1: Only "private" and "work" are guaranteed active.
 * Premium/custom lives are considered inactive until the life system exists.
 */
function isLifeActiveCoreV1(lifeId: LifeId): boolean {
  return lifeId === "private" || lifeId === "work";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAll(): Husket[] {
  const parsed = safeParse<Husket[]>(localStorage.getItem(KEY));
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Local in-tab subscribers.
 * Note: 'storage' event does not fire in the same tab that writes,
 * so we also notify subscribers directly.
 */
type RepoListener = () => void;
const listeners = new Set<RepoListener>();

export function subscribeRepo(listener: RepoListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitRepoChange() {
  for (const fn of Array.from(listeners)) {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  }
}

function writeAll(items: Husket[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  emitRepoChange();
}

export function listByLife(lifeId: LifeId, includeDeleted = false): Husket[] {
  const all = readAll();
  const filtered = all.filter((h) => h.lifeId === lifeId && (includeDeleted || !h.deletedAt));
  filtered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return filtered;
}

export function listTrash(): Husket[] {
  const all = readAll();
  const trashed = all.filter((h) => !!h.deletedAt);
  // Trash is sorted by deletedAt (most recently deleted first)
  trashed.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  return trashed;
}

export function upsert(item: Husket) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  writeAll(all);
}

export function getById(id: string): Husket | null {
  const all = readAll();
  return all.find((x) => x.id === id) ?? null;
}

export function softDelete(id: string) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return;

  const current = all[idx];
  all[idx] = {
    ...current,
    deletedAt: Date.now(),
    deletedFromLifeId: current.lifeId
  };
  writeAll(all);
}

function resolveRestoreLifeIdCoreV1(preferred: LifeId, fallback: LifeId = "private"): LifeId {
  return isLifeActiveCoreV1(preferred) ? preferred : fallback;
}

/**
 * Restore item from trash.
 *
 * Contract: Restore must handle deactivated life (fallback).
 * Core v1 implementation: custom lives are considered inactive until premium/life-admin exists.
 */
export function restoreFromTrash(id: string, targetLifeId: LifeId) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return;

  const current = all[idx];

  const resolvedLifeId = resolveRestoreLifeIdCoreV1(targetLifeId, "private");

  all[idx] = {
    ...current,
    lifeId: resolvedLifeId,
    deletedAt: undefined,
    deletedFromLifeId: undefined
  };

  writeAll(all);
}

export function emptyTrash() {
  const all = readAll();
  const keep = all.filter((x) => !x.deletedAt);
  writeAll(keep);
}

export function toggleFavorite(id: string) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return;

  const current = all[idx];
  const nextIsFav = !current.isFavorite;

  all[idx] = {
    ...current,
    isFavorite: nextIsFav ? true : undefined,
    favoritedAt: nextIsFav ? Date.now() : undefined
  };

  writeAll(all);
}
