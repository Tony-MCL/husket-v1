// ===============================
// src/domain/catalog.ts
// Product-defined catalogs (Core v1 offline)
// - Categories: icon + name (shown in settings list)
// - Ratings: will be icon-only in settings list (later)
//
// v0.2.10
// ===============================

export type CategoryDef = {
  id: string;
  name: string;
  icon: string; // emoji for now (later can be svg/icon system)
  requiresPro?: boolean;
};

export type RatingDef = {
  id: string;
  icon: string; // icon-only in settings list
  requiresPro?: boolean;
};

// -------------------------------
// Categories (product-defined)
// NOTE: ids are stable; do not change once shipped.
// -------------------------------
export const CATEGORY_CATALOG: CategoryDef[] = [
  { id: "cat.family", name: "Familie", icon: "👨‍👩‍👧‍👦" },
  { id: "cat.friends", name: "Venner", icon: "🧑‍🤝‍🧑" },
  { id: "cat.work", name: "Jobb", icon: "💼" },
  { id: "cat.travel", name: "Reise", icon: "✈️" },
  { id: "cat.food", name: "Mat", icon: "🍽️" },
  { id: "cat.nature", name: "Natur", icon: "🌿" },
  { id: "cat.sport", name: "Sport", icon: "🏃" },

  // Example “Pro-locked” categories (hook for paywall)
  { id: "cat.milestones", name: "Milepæler", icon: "🏁", requiresPro: true },
  { id: "cat.love", name: "Kjærlighet", icon: "❤️", requiresPro: true }
];

export function getCategoryById(id?: string) {
  if (!id) return null;
  return CATEGORY_CATALOG.find((c) => c.id === id) ?? null;
}

// -------------------------------
// Ratings (placeholder catalog for later)
// We'll wire selection similarly, but ratings are icon-only in settings list,
// and rating is NOT editable once set on Husket.
// -------------------------------
export const RATING_CATALOG: RatingDef[] = [
  { id: "rate.smile.1", icon: "😞" },
  { id: "rate.smile.2", icon: "😐" },
  { id: "rate.smile.3", icon: "🙂" },
  { id: "rate.smile.4", icon: "😄" },
  { id: "rate.smile.5", icon: "🤩" },

  { id: "rate.dice.1", icon: "⚀" },
  { id: "rate.dice.2", icon: "⚁" },
  { id: "rate.dice.3", icon: "⚂" },
  { id: "rate.dice.4", icon: "⚃" },
  { id: "rate.dice.5", icon: "⚄" },
  { id: "rate.dice.6", icon: "⚅" },

  // Example Pro-locked rating pack hook
  { id: "rate.ten.10", icon: "🔟", requiresPro: true }
];
