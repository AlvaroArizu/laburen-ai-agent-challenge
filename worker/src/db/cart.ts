// src/db/cart.ts

import type { Env } from "./client";
import { getUnitPriceForQty } from "./pricing";

export async function getOrCreateCart(env: Env, conversation_id: string) {
  const existing = await env.DB.prepare(
    "SELECT id, conversation_id, created_at, updated_at FROM carts WHERE conversation_id = ?"
  )
    .bind(conversation_id)
    .first<any>();

  if (existing) return existing;

  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO carts (id, conversation_id) VALUES (?, ?)")
    .bind(id, conversation_id)
    .run();

  return await env.DB.prepare("SELECT id, conversation_id, created_at, updated_at FROM carts WHERE id = ?")
    .bind(id)
    .first<any>();
}

export async function getCart(env: Env, conversation_id: string) {
  const cart = await env.DB.prepare(
    "SELECT id, conversation_id, created_at, updated_at FROM carts WHERE conversation_id = ?"
  )
    .bind(conversation_id)
    .first<any>();

  if (!cart) return null;

  const items = await env.DB.prepare(
    `
    SELECT
      ci.product_id,
      ci.qty,
      p.name,
      p.description,
      p.stock,
      p.price AS base_price,
      p.disponible
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY p.id ASC
  `
  )
    .bind(cart.id)
    .all<any>();

  const line_items: any[] = [];
  for (const r of items.results || []) {
    const product_id = Number(r.product_id);
    const qty = Number(r.qty);

    const pricing = await getUnitPriceForQty(env, product_id, qty);

    if (!pricing.ok) {
      const unit_price = Number(r.base_price);
      line_items.push({
        product_id,
        name: r.name,
        qty,
        unit_price,
        applied_min_qty: 1,
        tier_label: "base",
        line_total: unit_price * qty,
        stock: Number(r.stock),
        disponible: Number(r.disponible) === 1,
        note: pricing.error,
      });
      continue;
    }

    const unit_price = pricing.unit_price;
    line_items.push({
      product_id,
      name: r.name,
      qty,
      unit_price,
      applied_min_qty: pricing.applied_min_qty,
      tier_label: pricing.tier_label,
      line_total: unit_price * qty,
      stock: pricing.stock,
      disponible: true,
    });
  }

  const total = line_items.reduce((acc: number, x: any) => acc + Number(x.line_total || 0), 0);

  return { cart, items: line_items, total };
}

export async function validateCart(env: Env, conversation_id: string) {
  const view = await getCart(env, conversation_id);
  if (!view) return { ok: false as const, error: "cart_not_found" as const };

  const issues: any[] = [];
  for (const it of view.items) {
    if (!it.disponible) {
      issues.push({
        product_id: it.product_id,
        issue: "product_not_available",
        message: "Producto no disponible",
      });
    } else if (Number(it.qty) > Number(it.stock)) {
      issues.push({
        product_id: it.product_id,
        issue: "insufficient_stock",
        message: "Stock insuficiente",
        stock: it.stock,
        requested: it.qty,
        suggested_qty: it.stock,
      });
    }
  }

  return { ok: true as const, issues, view };
}
