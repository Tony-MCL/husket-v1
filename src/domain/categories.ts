// ===============================
// src/domain/categories.ts
// Core v1: app-defined categories (NOT user-defined).
// Icons are simple emoji placeholders for now (matches "icon + name").
//
// v0.2.14
// ===============================
export type CategoryDef = {
  id: string;
  icon: string;
  name: string;
};

export const CATEGORIES: CategoryDef[] = [
  { id: "family", icon: "👨‍👩‍👧‍👦", name: "Familie" },
  { id: "friends", icon: "🧑‍🤝‍🧑", name: "Venner" },
  { id: "travel", icon: "✈️", name: "Reise" },
  { id: "food", icon: "🍽️", name: "Mat" },
  { id: "nature", icon: "🌿", name: "Natur" },
  { id: "work", icon: "🧰", name: "Jobb" },
  { id: "home", icon: "🏠", name: "Hjem" },
  { id: "kids", icon: "🧒", name: "Barn" },
  { id: "pets", icon: "🐾", name: "Dyr" },
  { id: "sport", icon: "🏃", name: "Trening" },
  { id: "party", icon: "🎉", name: "Feiring" },
  { id: "other", icon: "🗂️", name: "Annet" }
];

export function categoryById(id?: string) {
  if (!id) return null;
  return CATEGORIES.find((c) => c.id === id) ?? null;
}
