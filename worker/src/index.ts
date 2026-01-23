// src/index.ts (Cloudflare Workers + D1 + MCP)
// Hardened MCP for Laburen challenge:
// - list_products (filters + disponible si/no/all + in_stock si/no/all + pagination + total + aliases + match)
// - list_facets (facets para desambiguar: prenda vs estilo, talles, colores)
// - get_product_details (with tiers + optional quote for qty)
// - quote_price (price by qty, backend authoritative)
// - get_products_by_ids
// - create_cart / update_cart (add/set/remove/clear + batch items[])
// - get_cart
// - validate_cart (detect unavailable / insufficient stock)
// - Structured MCP result (structuredContent + text fallback) per MCP spec
// - enableJsonResponse true (Cloudflare Agents createMcpHandler)
// - Audit logs: Workers logs + D1 request_logs (async via ctx.waitUntil)

import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface Env {
  DB: D1Database;

  // Auth
  MCP_AUTH_TOKEN?: string;
  MCP_AUTH_DISABLED?: string; // "true" para desactivar auth en dev

  // Logging/Audit
  LOG_TO_DB?: string; // "true" para guardar logs en D1
  LOG_BODY_MAX?: string; // por ej "1500"
}

type ApiOk<T> = { ok: true; data: T; request_id: string };
type ApiErr = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
  request_id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(extraHeaders || {}),
    },
  });
}

function handleOptions(request: Request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(null, { headers: { Allow: "GET, HEAD, POST, OPTIONS" } });
}

function nowIso() {
  return new Date().toISOString();
}

function truthy(v?: string) {
  const s = (v || "").toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safePreview(obj: unknown, maxLen: number) {
  try {
    const s = typeof obj === "string" ? obj : JSON.stringify(obj);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen) + "…";
  } catch {
    return "[unserializable]";
  }
}

/**
 * ============================
 * Auth (prod ON, dev OFF via MCP_AUTH_DISABLED)
 * ============================
 */
function isAuthorized(request: Request, env: Env) {
  if (truthy(env.MCP_AUTH_DISABLED)) return true;

  const token = (env.MCP_AUTH_TOKEN || "").trim();
  if (!token) return false;

  const auth = (request.headers.get("authorization") || "").trim();
  if (auth === `Bearer ${token}`) return true;

  const url = new URL(request.url);
  const qToken =
    (url.searchParams.get("token") || "").trim() ||
    (url.searchParams.get("auth") || "").trim() ||
    (url.searchParams.get("mcp_auth_token") || "").trim();

  return qToken === token;
}

function unauthorized(request_id: string) {
  const body: ApiErr = { ok: false, error: { code: "unauthorized", message: "Unauthorized" }, request_id };
  return jsonResponse(body, 401, { "x-request-id": request_id });
}

/**
 * ============================
 * Audit logging (Workers logs + optional D1 request_logs)
 * ============================
 */
async function writeAuditLog(env: Env, row: {
  request_id: string;
  ts: string;
  source: "mcp" | "http";
  path: string;
  method: string;
  tool?: string | null;
  conversation_id?: string | null;
  ok: 0 | 1;
  status?: number | null;
  duration_ms: number;
  error_code?: string | null;
  input_preview?: string | null;
  output_preview?: string | null;
}) {
  if (!truthy(env.LOG_TO_DB)) return;

  const conversation_key = row.conversation_id
    ? `conv:${row.conversation_id}`
    : `req:${row.request_id}`;

  // ✅ Solo actualizar conversation_key si hay conversation_id (para no pisar conv:* con req:*)
  const conversation_key_for_update = row.conversation_id ? conversation_key : null;

  // 1) Inserta si no existe
  await env.DB.prepare(
    `INSERT OR IGNORE INTO request_logs
      (id, ts, source, path, method, tool, conversation_id, conversation_key, ok, status, duration_ms, error_code, input_preview, output_preview)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      row.request_id,
      row.ts,
      row.source,
      row.path,
      row.method,
      row.tool ?? null,
      row.conversation_id ?? null,
      conversation_key,
      row.ok,
      row.status ?? null,
      row.duration_ms,
      row.error_code ?? null,
      row.input_preview ?? null,
      row.output_preview ?? null
    )
    .run();

  // 2) Actualiza siempre (por si llegó un segundo write con más info)
  await env.DB.prepare(
    `UPDATE request_logs SET
      ts = ?,
      source = ?,
      path = ?,
      method = ?,
      tool = ?,
      conversation_id = COALESCE(?, conversation_id),
      conversation_key = COALESCE(?, conversation_key),
      ok = ?,
      status = ?,
      duration_ms = ?,
      error_code = ?,
      input_preview = COALESCE(?, input_preview),
      output_preview = COALESCE(?, output_preview)
     WHERE id = ?`
  )
    .bind(
      row.ts,
      row.source,
      row.path,
      row.method,
      row.tool ?? null,
      row.conversation_id ?? null,
      conversation_key_for_update,
      row.ok,
      row.status ?? null,
      row.duration_ms,
      row.error_code ?? null,
      row.input_preview ?? null,
      row.output_preview ?? null,
      row.request_id
    )
    .run();
}




function logConsole(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}

/**
 * Wrap helper: creates request_id and measures duration
 */
function createReqContext(request: Request) {
  const request_id = crypto.randomUUID();
  const started = Date.now();
  const url = new URL(request.url);
  return { request_id, started, url, path: url.pathname, method: request.method };
}

/**
 * ============================
 * Pricing helpers (tiers)
 * ============================
 * - base: products.price
 * - tiers: product_price_tiers min_qty <= qty (highest wins)
 * Returns tier label for agent readability.
 */
async function getUnitPriceForQty(env: Env, product_id: number, qty: number) {
  const base = await env.DB.prepare(`SELECT id, price, stock, disponible FROM products WHERE id = ?`)
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

/**
 * ============================
 * Cart helpers (D1)
 * ============================
 */
async function getOrCreateCart(env: Env, conversation_id: string) {
  const existing = await env.DB.prepare("SELECT id, conversation_id, created_at, updated_at FROM carts WHERE conversation_id = ?")
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

async function getCart(env: Env, conversation_id: string) {
  const cart = await env.DB.prepare("SELECT id, conversation_id, created_at, updated_at FROM carts WHERE conversation_id = ?")
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

async function validateCart(env: Env, conversation_id: string) {
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

/**
 * ============================
 * MCP result helper (structuredContent + text fallback)
 * ============================
 */
function mcpResult(data: unknown, isError = false) {
  const text = JSON.stringify(data, null, 2);
  return {
    isError,
    structuredContent: data,
    content: [{ type: "text" as const, text }],
  } as any;
}

/**
 * ============================
 * Helpers: tolerancia plural/singular + matching
 * ============================
 */
function singularizeEs(s: string) {
  const t = (s || "").trim();
  if (!t) return t;

  const lower = t.toLowerCase();

  // Evitar romper palabras cortas: "mes", "tres", etc.
  if (lower.length <= 3) return t;

  if (lower.endsWith("es") && lower.length > 4) return t.slice(0, -2);
  if (lower.endsWith("s") && lower.length > 3) return t.slice(0, -1);
  return t;
}


/**
 * ============================
 * MCP server factory
 * ============================
 */
function buildMcpServer(env: Env) {
  const server = new McpServer({
    name: "Laburen.com MCP",
    version: "1.2.0",
  });

  /**
   * list_products (hardened + aliases + in_stock + match)
   */
  server.registerTool(
    "list_products",
    {
      title: "List Products",
      description:
        "Lista productos con filtros (q, disponible, in_stock, talla/talle, categoria/estilo, tipo_prenda/prenda, color) + match exact|contains + paginación (limit/offset) y total real.",
inputSchema: z.object({
  conversation_id: z.string().min(1).optional(),

  q: z.string().optional(),

  disponible: z.enum(["si", "no", "all"]).optional(),
  in_stock: z.enum(["si", "no", "all"]).optional(),

  talla: z.string().optional(),
  talle: z.string().optional(),

  categoria: z.string().optional(),
  estilo: z.string().optional(),

  tipo_prenda: z.string().optional(),
  prenda: z.string().optional(),

  color: z.string().optional(),

  match: z.enum(["exact", "contains"]).optional(),
  limit: z.coerce
    .number()
    .refine(Number.isFinite, "limit inválido")
    .int()
    .min(1)
    .max(500)
    .optional(),

  offset: z.coerce
    .number()
    .refine(Number.isFinite, "offset inválido")
    .int()
    .min(0)
    .max(50000)
    .optional(),
  sort: z.enum(["id", "price", "stock"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
}),

    },
    async (input: any) => {
      const q = (input.q || "").trim();
      const disponible = (input.disponible || "si") as "si" | "no" | "all";
      const in_stock = (input.in_stock || "all") as "si" | "no" | "all";
      const talla = ((input.talla ?? input.talle) || "").trim();
      const categoria = ((input.categoria ?? input.estilo) || "").trim();
      const tipo_prenda = ((input.tipo_prenda ?? input.prenda) || "").trim();
      const color = (input.color || "").trim();
      const match = (input.match || "contains") as "exact" | "contains";
      const conversation_id = (input.conversation_id || "").trim() || null;

      const limit = clamp(input.limit ?? 200, 1, 500);
      const offset = clamp(input.offset ?? 0, 0, 50000);
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
      const orderBy = `ORDER BY ${sort} ${order.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;

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


      

      return mcpResult({
        ok: true,
        filters: {
          q: q || undefined,
          disponible,
          in_stock,
          match,
          talla: talla || undefined,
          categoria: categoria || undefined,
          tipo_prenda: tipo_prenda || undefined,
          color: color || undefined,
          // alias informativo para agentes
          aliases: {
            talle: input.talle ? true : undefined,
            estilo: input.estilo ? true : undefined,
            prenda: input.prenda ? true : undefined,
          },
        },
        paging: { limit, offset, total, has_more: offset + items.length < total },
        items,
note_for_agents:
  "Definiciones: disponible=flag del catálogo (vendible). in_stock=stock real (stock>0). " +
  "Si el usuario dice 'en stock' normalmente significa vendible+stock => usar disponible='si' e in_stock='si'. " +
  "Si pide 'aunque no esté disponible', usar disponible='all' e in_stock='si'. " +
  "Para 'todos', usar disponible='all' e in_stock='all'.",

      });
    }
  );

  /**
   * list_facets (para desambiguación: prenda vs estilo, talles, colores)
   */
  server.registerTool(
    "list_facets",
    {
      title: "List Facets",
      description:
        "Devuelve valores existentes del catálogo para desambiguar: tipo_prenda (prenda) vs categoria (estilo), además de talles y colores. Incluye conteos y stock.",
    inputSchema: z.object({
      disponible: z.enum(["si", "no", "all"]).optional(),
      in_stock: z.enum(["si", "no", "all"]).optional(),
      q: z.string().optional(),
      limit: z.coerce
      .number()
      .refine(Number.isFinite, "limit inválido")
      .int()
      .min(1)
      .max(200)
      .optional(),

    }),

    },
    async (input: any) => {
      const disponible = (input.disponible || "all") as "si" | "no" | "all";
      const in_stock = (input.in_stock || "all") as "si" | "no" | "all";
      const q = (input.q || "").trim();
      const limit = clamp(input.limit ?? 50, 1, 200);

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

      return mcpResult({
        ok: true,
        field_definitions: {
          tipo_prenda: "Tipo de prenda (ej: Camiseta, Sudadera, Pantalón).",
          categoria: "Estilo/categoría (ej: Casual, Deportivo, Formal).",
          talla: "Talle (ej: S, M, L, XL).",
          color: "Color (ej: Negro, Blanco).",
        },
        filters: { disponible, in_stock, q: q || undefined, limit },
        facets: {
          tipo_prenda: await facet("tipo_prenda"),
          categoria: await facet("categoria"),
          talla: await facet("talla"),
          color: await facet("color"),
        },
        note_for_agents:
          "Si el usuario pide 'categorías' y no especifica, preguntá: ¿te referís a tipo_prenda (prenda) o a categoria (estilo)? Usá list_facets para mostrar opciones reales.",
      });
    }
  );

  /**
   * get_product_details (+ tiers, + optional quote if qty provided)
   */
  server.registerTool(
    "get_product_details",
    {
      title: "Get Product Details",
      description:
        "Obtiene detalle de un producto por id. Incluye tiers de precio si existen. Opcional: qty para devolver precio aplicado.",
      inputSchema: z.object({
      id: z.coerce
      .number()
      .refine(Number.isFinite, "id inválido")
      .int()
      .positive(),

      qty: z.coerce
        .number()
        .refine(Number.isFinite, "qty inválido")
        .int()
        .positive()
        .optional(),


      }),

    },
    async ({ id, qty }: { id: number; qty?: number }) => {
      const product = await env.DB.prepare(
        `SELECT
           id, name, description, price, stock,
           tipo_prenda, talla, color, categoria, disponible
         FROM products
         WHERE id = ?`
      )
        .bind(id)
        .first<any>();

      if (!product) return mcpResult({ ok: false, error: { code: "not_found", message: "Producto no encontrado" } }, true);

      const tiers = await env.DB.prepare(
        `SELECT min_qty, price
         FROM product_price_tiers
         WHERE product_id = ?
         ORDER BY min_qty ASC`
      )
        .bind(id)
        .all<any>();

      let quote: any = null;
      if (qty && Number.isFinite(qty) && qty > 0) {
        const pricing = await getUnitPriceForQty(env, id, qty);
        if (pricing.ok) {
          quote = {
            qty,
            unit_price: pricing.unit_price,
            applied_min_qty: pricing.applied_min_qty,
            tier_label: pricing.tier_label,
            line_total: pricing.unit_price * qty,
            stock: pricing.stock,
            is_stock_ok: qty <= pricing.stock,
          };
        } else {
          quote = { qty, error: pricing.error };
        }
      }

      return mcpResult({ ok: true, product, price_tiers: tiers.results || [], quote });
    }
  );

  /**
   * quote_price (authoritative pricing by qty)
   */
  server.registerTool(
    "quote_price",
    {
      title: "Quote Price",
      description:
        "Cotiza el precio para un producto y una cantidad (aplica tiers desde backend). Devuelve unit_price aplicado y total.",
      inputSchema: z.object({
      product_id: z.coerce
        .number()
        .refine(Number.isFinite, "product_id inválido")
        .int()
        .positive(),

      qty: z.coerce
        .number()
        .refine(Number.isFinite, "qty inválido")
        .int()
        .positive(),


      }),

    },
    async ({ product_id, qty }: { product_id: number; qty: number }) => {
      const pricing = await getUnitPriceForQty(env, product_id, qty);
      if (!pricing.ok) {
        return mcpResult(
          {
            ok: false,
            error: { code: pricing.error, message: "No se pudo cotizar (producto no encontrado o no disponible)" },
          },
          true
        );
      }
      return mcpResult({
        ok: true,
        product_id,
        qty,
        unit_price: pricing.unit_price,
        applied_min_qty: pricing.applied_min_qty,
        tier_label: pricing.tier_label,
        line_total: pricing.unit_price * qty,
        stock: pricing.stock,
        is_stock_ok: qty <= pricing.stock,
      });
    }
  );

  /**
   * get_products_by_ids
   */
  server.registerTool(
    "get_products_by_ids",
    {
      title: "Get Products By IDs",
      description: "Obtiene productos por una lista de IDs (mantiene orden, reporta faltantes).",
      inputSchema: z.object({
        ids: z.array(z.coerce.number().int().positive()).min(1).max(200),
      }),

    },
    async ({ ids }: { ids: number[] }) => {
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
      return mcpResult({ ok: true, items, missing });
    }
  );

  /**
   * create_cart
   */
  server.registerTool(
    "create_cart",
    {
      title: "Create Cart",
      description: "Crea (o reutiliza) un carrito para un conversation_id y devuelve el estado del carrito.",
      inputSchema: z.object({
        conversation_id: z.string().min(1),
      }),

    },
    async ({ conversation_id }: { conversation_id: string }) => {
      const cart = await getOrCreateCart(env, conversation_id);
      const view = await getCart(env, conversation_id);
      return mcpResult({ ok: true, cart, view });
    }
  );

  /**
   * update_cart (hardened)
   * - action: add/set/remove/clear
   * - supports batch: items[] (applies action per item)
   */
  server.registerTool(
    "update_cart",
    {
      title: "Update Cart",
      description:
        "Actualiza el carrito: add/set/remove/clear. Soporta batch con items[]. Valida stock y devuelve view actualizado.",
      inputSchema: z.object({
        conversation_id: z.string().min(1),
        action: z.enum(["add", "set", "remove", "clear"]),

        product_id: z.coerce
          .number()
          .refine(Number.isFinite, "product_id inválido")
          .int()
          .positive()
          .optional(),

        qty: z.coerce
          .number()
          .refine(Number.isFinite, "qty inválido")
          .int()
          .min(0)
          .optional(),

        items: z.array(
          z.object({
            product_id: z.coerce
              .number()
              .refine(Number.isFinite, "product_id inválido")
              .int()
              .positive(),

            qty: z.coerce
              .number()
              .refine(Number.isFinite, "qty inválido")
              .int()
              .min(0),
          })
        )
          .max(100)
          .optional(),
      }),


    },
    async (input: any) => {
      const { conversation_id, action } = input;
      const cart = await getOrCreateCart(env, conversation_id);

      if (action === "clear") {
        await env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ?").bind(cart.id).run();
        return mcpResult({ ok: true, view: await getCart(env, conversation_id) });
      }

      const ops: Array<{ product_id: number; qty: number }> = [];
      if (input.items?.length) {
        ops.push(...input.items.map((x: any) => ({ product_id: Number(x.product_id), qty: Number(x.qty) })));
      } else if (input.product_id && input.qty !== undefined) {
        ops.push({ product_id: Number(input.product_id), qty: Number(input.qty) });
      } else if (action === "remove" && input.product_id) {
        ops.push({ product_id: Number(input.product_id), qty: 1 });
      } else {
        return mcpResult({ ok: false, error: { code: "bad_request", message: "Faltan product_id/qty o items[]" } }, true);
      }

      const errors: any[] = [];

      for (const op of ops) {
        const product_id = op.product_id;
        const qty = Number(op.qty);

        const product = await env.DB.prepare("SELECT id, stock, disponible FROM products WHERE id = ?")
          .bind(product_id)
          .first<any>();

        if (!product) {
          errors.push({ product_id, code: "product_not_found" });
          continue;
        }

        if (Number(product.disponible) !== 1) {
          errors.push({ product_id, code: "product_not_available" });
          continue;
        }

        const existing = await env.DB.prepare("SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?")
          .bind(cart.id, product_id)
          .first<any>();

        if (action === "remove") {
          if (existing) {
            await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(existing.id).run();
          }
          continue;
        }

        if (!Number.isFinite(qty) || qty < 0) {
          errors.push({ product_id, code: "qty_invalid" });
          continue;
        }

        // si hacen set en 0 => remove
        if (action === "set" && qty === 0) {
          if (existing) {
            await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(existing.id).run();
          }
          continue;
        }

        // si hacen add con 0 => no-op (o si querés, devolver error)
        if (action === "add" && qty === 0) {
          continue;
        }


        const newQty = action === "add" ? Number(existing?.qty ?? 0) + qty : qty;

        if (newQty > Number(product.stock)) {
          errors.push({
            product_id,
            code: "insufficient_stock",
            stock: Number(product.stock),
            requested: newQty,
          });
          continue;
        }

        if (existing) {
          await env.DB.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").bind(newQty, existing.id).run();
        } else {
          await env.DB.prepare("INSERT INTO cart_items (id, cart_id, product_id, qty) VALUES (?, ?, ?, ?)")
            .bind(crypto.randomUUID(), cart.id, product_id, newQty)
            .run();
        }
      }

      const view = await getCart(env, conversation_id);
      return mcpResult({ ok: true, errors, view });
    }
  );

  /**
   * get_cart
   */
  server.registerTool(
    "get_cart",
    {
      title: "Get Cart",
      description: "Obtiene el carrito (y sus items) para un conversation_id.",
      inputSchema: z.object({
        conversation_id: z.string().min(1),
      }),

    },
    async ({ conversation_id }: { conversation_id: string }) => {
      const view = await getCart(env, conversation_id);
      if (!view) return mcpResult({ ok: false, error: { code: "not_found", message: "Carrito no encontrado" } }, true);
      return mcpResult({ ok: true, view });
    }
  );

  /**
   * validate_cart
   */
  server.registerTool(
    "validate_cart",
    {
      title: "Validate Cart",
      description: "Valida el carrito: detecta productos no disponibles o stock insuficiente y sugiere qty.",
      inputSchema: z.object({
        conversation_id: z.string().min(1),
      }),

    },
    async ({ conversation_id }: { conversation_id: string }) => {
      const res = await validateCart(env, conversation_id);
      if (!res.ok) return mcpResult({ ok: false, error: { code: res.error, message: "Carrito no encontrado" } }, true);
      return mcpResult({ ok: true, issues: res.issues, view: res.view });
    }
  );

  return server;
}

/**
 * ============================
 * Worker fetch
 * ============================
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const rc = createReqContext(request);
    const bodyMax = clamp(Number(env.LOG_BODY_MAX || "1500"), 200, 10000);

    // CORS preflight
    if (request.method === "OPTIONS") return handleOptions(request);

    const pathLower = rc.url.pathname.toLowerCase();
    const isMcp = pathLower === "/mcp" || pathLower.startsWith("/mcp/");

    try {
      /**
       * MCP endpoint
       */
    if (isMcp) {
      if (!isAuthorized(request, env)) return unauthorized(rc.request_id);

      const server = buildMcpServer(env);

      const handler = createMcpHandler(server, {
        route: "/mcp",
        corsOptions: {
          origin: "*",
          methods: "GET, POST, OPTIONS",
          headers: "Content-Type, Authorization",
          maxAge: 86400,
        },
        enableJsonResponse: true,
      });

      //  DECLARACIONES (para que no sea "no existe en el ámbito")
      let toolName: string | null = null;
      let conversation_id: string | null = null;
      let input_preview: string | null = null;
      let output_preview: string | null = null;

      //  INTENTAR LEER BODY SIN CONSUMIR REQUEST
      try {
        if (request.method === "POST") {
          const clone = request.clone();
          const ct = (clone.headers.get("content-type") || "").toLowerCase();
          if (ct.includes("application/json")) {
            const body: any = await clone.json();


            
            toolName =
              body?.params?.name ||
              body?.params?.tool ||
              body?.tool ||
              null;


            conversation_id =
              body?.params?.arguments?.conversation_id ||
              body?.params?.arguments?.context?.conversation_id ||
              body?.context?.conversation_id ||
              null;

            input_preview = safePreview(body, bodyMax);
          }
        }
      } catch (e: any) {
      input_preview = `[log-parse-error] ${String(e?.message || e)}`;
    }

      const res = await handler(request, env, ctx);

      const duration_ms = Date.now() - rc.started;

      //  CAPTURAR OUTPUT PREVIEW (evitar SSE/stream)
      try {
        const ctRes = (res.headers.get("content-type") || "").toLowerCase();
        const isSse = res.status === 202 || ctRes.includes("text/event-stream");
        if (!isSse) {
          const txt = await res.clone().text();
          output_preview = safePreview(txt, bodyMax);
        }
      } catch {
        // ignore
      }

      logConsole({
        ts: nowIso(),
        request_id: rc.request_id,
        source: "mcp",
        path: rc.path,
        method: rc.method,
        status: res.status,
        duration_ms,
        tool: toolName,
        conversation_id,
      });

      ctx.waitUntil(
        writeAuditLog(env, {
          request_id: rc.request_id,
          ts: nowIso(),
          source: "mcp",
          path: rc.path,
          method: rc.method,
          tool: toolName,
          conversation_id: conversation_id,
          ok: res.ok ? 1 : 0,
          status: res.status,
          duration_ms,
          error_code: res.ok ? null : `http_${res.status}`,
          input_preview: input_preview,
          output_preview: output_preview,
        })
      );

      const headers = new Headers(res.headers);
      headers.set("x-request-id", rc.request_id);
      return new Response(res.body, { status: res.status, headers });
    }


      /**
       * Healthcheck
       */
      if (rc.path === "/" && request.method === "GET") {
        const out: ApiOk<any> = {
          ok: true,
          request_id: rc.request_id,
          data: {
            status: "ok",
            service: "laburen-mcp",
            hint: "MCP endpoint is /mcp",
            tools: [
              "list_products",
              "list_facets",
              "get_product_details",
              "quote_price",
              "get_products_by_ids",
              "create_cart",
              "update_cart",
              "get_cart",
              "validate_cart",
            ],
          },
        };
        return jsonResponse(out, 200, { "x-request-id": rc.request_id });
      }

      /**
       * Optional REST endpoints (kept, but aligned to same behavior as MCP)
       */
      if (pathLower === "/products" && request.method === "GET") {
        const q = (rc.url.searchParams.get("q") || "").trim();
        const disponible = (rc.url.searchParams.get("disponible") || "si") as "si" | "no" | "all";
        const in_stock = (rc.url.searchParams.get("in_stock") || "all") as "si" | "no" | "all";
        const talla = (rc.url.searchParams.get("talla") || rc.url.searchParams.get("talle") || "").trim();
        const categoria = (rc.url.searchParams.get("categoria") || rc.url.searchParams.get("estilo") || "").trim();
        const tipo_prenda = (rc.url.searchParams.get("tipo_prenda") || rc.url.searchParams.get("prenda") || "").trim();
        const color = (rc.url.searchParams.get("color") || "").trim();
        const match = (rc.url.searchParams.get("match") || "contains") as "exact" | "contains";
        const limit = clamp(Number(rc.url.searchParams.get("limit") || "200"), 1, 500);
        const offset = clamp(Number(rc.url.searchParams.get("offset") || "0"), 0, 50000);

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

        const countRow = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM products ${whereSql}`)
          .bind(...params)
          .first<any>();
        const total = Number(countRow?.cnt ?? 0);

        const rows = await env.DB.prepare(
          `
          SELECT
            id, name, description, price, stock, disponible,
            tipo_prenda, talla, color, categoria
          FROM products
          ${whereSql}
          ORDER BY id ASC
          LIMIT ? OFFSET ?
        `
        )
          .bind(...params, limit, offset)
          .all<any>();

        const out: ApiOk<any> = {
          ok: true,
          request_id: rc.request_id,
          data: {
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
            paging: { limit, offset, total, has_more: offset + (rows.results?.length || 0) < total },
            items: rows.results || [],
          },
        };

        return jsonResponse(out, 200, { "x-request-id": rc.request_id });
      }

      /**
       * Not found
       */
      const out: ApiErr = {
        ok: false,
        request_id: rc.request_id,
        error: { code: "not_found", message: "Not Found", details: { path: rc.path } },
      };
      return jsonResponse(out, 404, { "x-request-id": rc.request_id });
    } catch (err: any) {
      const duration_ms = Date.now() - rc.started;

      const code = "internal_error";
      const message = err?.message || "Unexpected error";
      const details = truthy(env.MCP_AUTH_DISABLED) ? { stack: err?.stack } : undefined;

      logConsole({
        ts: nowIso(),
        request_id: rc.request_id,
        source: isMcp ? "mcp" : "http",
        path: rc.path,
        method: rc.method,
        ok: false,
        error: { code, message },
        duration_ms,
      });

      ctx.waitUntil(
        writeAuditLog(env, {
          request_id: rc.request_id,
          ts: nowIso(),
          source: isMcp ? "mcp" : "http",
          path: rc.path,
          method: rc.method,
          tool: null,
          conversation_id: null,
          ok: 0,
          status: 500,
          duration_ms,
          error_code: code,
          input_preview: safePreview({ path: rc.path, method: rc.method }, bodyMax),
          output_preview: safePreview({ code, message }, bodyMax),
        })
      );

      const out: ApiErr = {
        ok: false,
        request_id: rc.request_id,
        error: { code, message, details },
      };
      return jsonResponse(out, 500, { "x-request-id": rc.request_id });
    }
  },
};
