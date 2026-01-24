import type { Env } from "./client";
import { clamp, singularizeEs } from "../utils/text";

export type ListProductsInput = {
  q?: string;
  disponible?: "si" | "no" | "all";
  in_stock?: "si" | "no" | "all";
  talla?: string;
  talle?: string;
  categoria?: string;
  estilo?: string;
  tipo_prenda?: string;
  prenda?: string;
  color?: string;
  match?: "exact" | "contains";
  limit?: number;
  offset?: number;
  sort?: "id" | "price" | "stock";
  order?: "asc" | "desc";
};

export async function listProductsDb(env: Env, input: ListProductsInput) {
  const q = (input.q || "").trim();
  const disponible = (input.disponible || "si") as "si" | "no" | "all";
  const in_stock = (input.in_stock || "all") as "si" | "no" | "all";
  const talla = ((input.talla ?? input.talle) || "").trim();
  const categoria = ((input.categoria ?? input.estilo) || "").trim();
  const tipo_prenda = ((input.tipo_prenda ?? input.prenda) || "").trim();
  const color = (input.color || "").trim();
  const match = (input.match || "contains") as "exact" | "contains";

  const limit = clamp((input.limit as any) ?? 200, 1, 500);
  const offset = clamp((input.offset as any) ?? 0, 0, 50000);
  const sort = (input.sort || "id") as "id" | "price" | "stock";
  const order = (input.order || "asc") as "asc" | "desc";

  const where: string[] = [];
  const params: any[] = [];

  // disponible
  if (disponible === "si") where.push("disponible = 1");
  if (disponible === "no") where.push("disponible = 0");

  // stock
  if (in_stock === "si") where.push("stock > 0");
  if (in_stock === "no") where.push("stock <= 0");

  // búsqueda general
  if (q) {
    where.push(`(
      name LIKE ? OR description LIKE ? OR
      tipo_prenda LIKE ? OR categoria LIKE ? OR color LIKE ? OR talla LIKE ?
    )`);
    const qq = `%${q}%`;
    params.push(qq, qq, qq, qq, qq, qq);
  }

  // helper filtro texto (exact/contains) + plural/singular
  const addTextFilter = (field: string, value: string) => {
    if (!value) return;
    const v1 = value;
    const v2 = singularizeEs(value);
    const values = v2 && v2 !== v1 ? [v1, v2] : [v1];

    if (match === "exact") {
      if (values.length === 1) {
        where.push(`LOWER(${field}) = LOWER(?)`);
        params.push(values[0]);
      } else {
        where.push(`(LOWER(${field}) = LOWER(?) OR LOWER(${field}) = LOWER(?))`);
        params.push(values[0], values[1]);
      }
    } else {
      if (values.length === 1) {
        where.push(`LOWER(${field}) LIKE LOWER(?)`);
        params.push(`%${values[0]}%`);
      } else {
        where.push(`(LOWER(${field}) LIKE LOWER(?) OR LOWER(${field}) LIKE LOWER(?))`);
        params.push(`%${values[0]}%`, `%${values[1]}%`);
      }
    }
  };

  addTextFilter("talla", talla);
  addTextFilter("categoria", categoria);
  addTextFilter("tipo_prenda", tipo_prenda);
  addTextFilter("color", color);

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // orderBy safe (solo whitelisted)
  const sortField = sort === "price" ? "price" : sort === "stock" ? "stock" : "id";
  const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const orderBy = `ORDER BY ${sortField} ${sortOrder}`;

  const countRow = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM products ${whereSql}`)
    .bind(...params)
    .first<any>();
  const total = Number(countRow?.cnt ?? 0);

  const result = await env.DB.prepare(
    `
      SELECT
        id, name, description, price, stock, disponible,
        tipo_prenda, talla, color, categoria
      FROM products
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
    `
  )
    .bind(...params, limit, offset)
    .all<any>();

  const items = (result.results || []).map((p: any) => ({
    ...p,
    in_stock_bool: Number(p.stock) > 0,
    sellable: Number(p.disponible) === 1 && Number(p.stock) > 0,
  }));

  return {
    filters: {
      q: q || undefined,
      disponible,
      in_stock,
      match,
      talla: talla || undefined,
      categoria: categoria || undefined,
      tipo_prenda: tipo_prenda || undefined,
      color: color || undefined,
    },
    paging: { limit, offset, total, has_more: offset + items.length < total },
    items,
  };
}

export async function listFacetsDb(env: Env, input: { disponible?: "si" | "no" | "all"; in_stock?: "si" | "no" | "all"; q?: string; limit?: number }) {
  const disponible = (input.disponible || "all") as "si" | "no" | "all";
  const in_stock = (input.in_stock || "all") as "si" | "no" | "all";
  const q = (input.q || "").trim();
  const limit = clamp((input.limit as any) ?? 50, 1, 200);

  const where: string[] = [];
  const params: any[] = [];

  if (disponible === "si") where.push("disponible = 1");
  if (disponible === "no") where.push("disponible = 0");
  if (in_stock === "si") where.push("stock > 0");
  if (in_stock === "no") where.push("stock <= 0");

  if (q) {
    where.push(`(
      name LIKE ? OR description LIKE ? OR
      tipo_prenda LIKE ? OR categoria LIKE ? OR color LIKE ? OR talla LIKE ?
    )`);
    const qq = `%${q}%`;
    params.push(qq, qq, qq, qq, qq, qq);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  async function facet(field: "tipo_prenda" | "categoria" | "talla" | "color") {
    const r = await env.DB.prepare(
      `SELECT ${field} as value,
              COUNT(*) as count,
              SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock_count,
              SUM(CASE WHEN disponible = 1 THEN 1 ELSE 0 END) as disponible_count
       FROM products
       ${whereSql}
       GROUP BY ${field}
       ORDER BY count DESC
       LIMIT ?`
    )
      .bind(...params, limit)
      .all<any>();

    return (r.results || []).filter((x: any) => (x.value ?? "").toString().trim().length > 0);
  }

  return {
    filters: { disponible, in_stock, q: q || undefined, limit },
    facets: {
      tipo_prenda: await facet("tipo_prenda"),
      categoria: await facet("categoria"),
      talla: await facet("talla"),
      color: await facet("color"),
    },
  };
}

export async function getProductById(env: Env, id: number) {
  return await env.DB.prepare(
    `SELECT
       id, name, description, price, stock,
       tipo_prenda, talla, color, categoria, disponible
     FROM products
     WHERE id = ?`
  )
    .bind(id)
    .first<any>();
}

export async function getPriceTiers(env: Env, product_id: number) {
  const tiers = await env.DB.prepare(
    `SELECT min_qty, price
     FROM product_price_tiers
     WHERE product_id = ?
     ORDER BY min_qty ASC`
  )
    .bind(product_id)
    .all<any>();
  return tiers.results || [];
}

export async function getProductsByIdsDb(env: Env, ids: number[]) {
  const uniq = Array.from(new Set(ids));
  const placeholders = uniq.map(() => "?").join(",");

  const rows = await env.DB.prepare(
    `SELECT
       id, name, description, price, stock, disponible,
       tipo_prenda, talla, color, categoria
     FROM products
     WHERE id IN (${placeholders})`
  )
    .bind(...uniq)
    .all<any>();

  const byId = new Map<number, any>();
  for (const r of rows.results || []) byId.set(Number(r.id), r);

  const items = ids.map((id) => byId.get(Number(id)) || null);
  const missing = ids.filter((id) => !byId.has(Number(id)));
  return { items, missing };
}
