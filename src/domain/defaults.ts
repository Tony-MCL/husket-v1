// ===============================
// src/domain/defaults.ts
// ===============================
import type { LifeId } from "./types";

export type LifeDef = {
  id: LifeId;
  label: string;
  isPremium?: boolean;
};

export const CORE_LIVES: LifeDef[] = [
  { id: "private", label: "Privat" },
  { id: "work", label: "Jobb" },
  { id: "custom1", label: "Egendefinert 1", isPremium: true },
  { id: "custom2", label: "Egendefinert 2", isPremium: true }
];

export const CORE_VISIBLE_LIVES: LifeId[] = ["private", "work"];
