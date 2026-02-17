// ===============================
// src/domain/id.ts
// ===============================
export function makeId(): string {
  // Prefer native UUID if available
  const anyCrypto = globalThis.crypto as unknown as { randomUUID?: () => string } | undefined;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();

  // Fallback: reasonably unique
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
