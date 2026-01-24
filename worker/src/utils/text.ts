export function nowIso() {
  return new Date().toISOString();
}

export function truthy(v?: string) {
  const s = (v || "").toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function safePreview(obj: unknown, maxLen: number) {
  try {
    const s = typeof obj === "string" ? obj : JSON.stringify(obj);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen) + "…";
  } catch {
    return "[unserializable]";
  }
}

/**
 * Helpers: tolerancia plural/singular + matching
 */
export function singularizeEs(s: string) {
  const t = (s || "").trim();
  if (!t) return t;

  const lower = t.toLowerCase();

  // Evitar romper palabras cortas: "mes", "tres", etc.
  if (lower.length <= 3) return t;

  if (lower.endsWith("es") && lower.length > 4) return t.slice(0, -2);
  if (lower.endsWith("s") && lower.length > 3) return t.slice(0, -1);
  return t;
}
