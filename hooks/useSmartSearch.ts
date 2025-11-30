"use client";

export type PostOpt =
  | "Sale"
  | "Rent"
  | "Trade"
  | "Emergency Lending"
  | "PasaBuy"
  | "Donation and Giveaway";

export function asPostOpt(s: string): PostOpt | null {
  const map: Record<string, PostOpt> = {
    Sale: "Sale",
    Rent: "Rent",
    Trade: "Trade",
    "Emergency Lending": "Emergency Lending",
    PasaBuy: "PasaBuy",
    "Donation and Giveaway": "Donation and Giveaway",
  };
  return map[s] ?? null;
}

/* extract price */
export function getPrice(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/* strict multi-word search */
export function matchesSmartMulti(text: string, query: string) {
  if (!query) return true;

  const words = text.toLowerCase().split(/\s+/);
  const queries = query.toLowerCase().split(/\s+/).filter(Boolean);

  return queries.every((q) =>
    words.some((word) => word.startsWith(q))
  );
}
