// ===============================
// src/domain/types.ts
// ===============================
export type LifeId = "private" | "work" | "custom1" | "custom2";

export type PanelId = "album" | "capture";

export type DatePreset = "week" | "month" | "year" | "custom";

export type HusketLocation = {
  lat: number;
  lon: number;
  accuracyM?: number;
};

export type HusketImageMeta = {
  mime: string;
  width: number;
  height: number;
};

export type Husket = {
  id: string; // uuid
  lifeId: LifeId;

  createdAt: number; // epoch ms
  comment?: string;
  commentEditedAt?: number;

  ratingId?: string; // rating pack later
  categoryId?: string;

  isFavorite?: boolean;
  favoritedAt?: number;

  imageMeta: HusketImageMeta;
  imageDataUrl: string; // Core v1: store as data URL (simple). Later: IDB/blob.

  location?: HusketLocation;

  deletedAt?: number;
  deletedFromLifeId?: LifeId;
};

export type AlbumFilters = {
  favoriteOnly?: boolean;
  categoryId?: string;
  ratingId?: string;

  datePreset?: DatePreset;
  customFrom?: number; // epoch
  customTo?: number; // epoch
};
