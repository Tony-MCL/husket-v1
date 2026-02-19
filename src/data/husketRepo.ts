// ===============================
// src/data/husketRepo.ts
// Core v1 storage: localStorage (simple + stable skeleton)
// Later: replace with IDB without touching UI contract.
//
// v0.2.7:
// - add setCategory(id, categoryId?) for editable category
// ===============================
import type { Husket, LifeId } from "../domain/types";

const KEY = "husket.core.items.v1";

// Simple in-memory subscribers for "repo changed" signals
type RepoListener = () => void;
const listeners = new Set<RepoListener>();
function emit() {
  for (const fn of Array.from(listeners)) {
    try {
      fn();
    } catch {
      // ignore
    }
  }
}
export function subscribeRepo(fn: RepoListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
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

function writeAll(items: Husket[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
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

export function restoreFromTrash(id: string, targetLifeId: LifeId) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return;

  const current = all[idx];
  all[idx] = {
    ...current,
    lifeId: targetLifeId,
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

// v0.2.7: editable category
export function setCategory(id: string, categoryId?: string) {
  const all = readAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return;

  const current = all[idx];
  const clean = (categoryId ?? "").trim();

  all[idx] = {
    ...current,
    categoryId: clean ? clean : undefined
  };

  writeAll(all);
}
