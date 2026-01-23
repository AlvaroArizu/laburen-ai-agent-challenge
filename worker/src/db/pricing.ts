// src/db/pricing.ts

import type { Env } from "./client";

/**
 * Pricing helpers (tiers)
 * - base: products.price
 * - tiers: product_price_tiers min_qty <= qty (highest wins)
 * Returns tier label for agent readability.
 */
export async function getUnitPriceForQty(env: Env, product_id: number, qty: number) {
  const base = await env.DB.prepare(
    `SELECT id, price, stock, disponible FROM products WHERE id = ?`
  )
    .bind(product_id)
    .first<any>();

  if (!base) {
    return { ok: false as const, error: "product_not_found" as const };
  }

  const disponible = Number(base.disponible) === 1;
  const base_price = Number(base.price);
  const stock = Number(base.stock);

  if (!disponible) {
    return { ok: false as const, error: "product_not_available" as const, base_price, stock };
  }

  const tier = await env.DB.prepare(
    `SELECT min_qty, price
     FROM product_price_tiers
     WHERE product_id = ? AND min_qty <= ?
     ORDER BY min_qty DESC
     LIMIT 1`
  )
    .bind(product_id, qty)
    .first<any>();

  const unit_price = tier ? Number(tier.price) : base_price;
  const applied_min_qty = tier ? Number(tier.min_qty) : 1;

  const tier_label =
    applied_min_qty >= 200 ? "200+" : applied_min_qty >= 100 ? "100+" : applied_min_qty >= 50 ? "50+" : "base";

  return {
    ok: true as const,
    unit_price,
    applied_min_qty,
    tier_label,
    stock,
    base_price,
  };
}
