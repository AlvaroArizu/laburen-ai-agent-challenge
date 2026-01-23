// index.ts (Cloudflare Workers + D1 + MCP)
//  Ajustado para el desafío: tools MCP con nombres alineados
// - list_products
// - create_cart
// - update_cart
// + get_product_details (para detalle por ID)
//  Cálculo correcto de precios por volumen (tiers) SIEMPRE desde backend (D1)
//  El carrito devuelve unit_price aplicado según qty + total correcto

import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface Env {
  DB: D1Database;
  MCP_AUTH_TOKEN: string;
}

/**
 * ============================
 * Seguridad MCP (desactivada para debug)
 * ============================
 */
function isAuthorized(_request: Request, _env: Env) {
  return true; // 👈 dejalo true para el challenge/debug
}
function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

/**
 * ============================
 * Helpers HTTP
 * ============================
 */
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
function badRequest(message: string, details?: unknown) {
  return json({ error: "bad_request", message, details }, 400);
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
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
function notFound(path?: string) {
  return json({ error: "not_found", path }, 404);
}
async function readJson<T>(request: Request): Promise<T> {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Content-Type must be application/json");
  return (await request.json()) as T;
}

/**
 * ============================
 * Pricing helpers (tiers)
 * ============================
 * Regla:
 * - unit_price base = products.price
 * - si hay tiers en product_price_tiers, aplica el mayor min_qty <= qty
 *   (ej: qty=60 aplica min_qty=50; qty=120 aplica min_qty=100; etc.)
 */
async function getUnitPriceForQty(env: Env, product_id: number, qty: number) {
  const base = await env.DB.prepare(
    `SELECT id, price, stock, disponible FROM products WHERE id = ?`
  )
    .bind(product_id)
    .first<any>();

  if (!base || Number(base.disponible) !== 1) {
    return { ok: false as const, error: "product_not_found_or_not_available" as const };
  }

  const basePrice = Number(base.price);
  const stock = Number(base.stock);

  // Busca el tier más alto aplicable: max(min_qty) <= qty
  const tier = await env.DB.prepare(
    `SELECT min_qty, price
     FROM product_price_tiers
     WHERE product_id = ? AND min_qty <= ?
     ORDER BY min_qty DESC
     LIMIT 1`
  )
    .bind(product_id, qty)
    .first<any>();

  const unit_price = tier ? Number(tier.price) : basePrice;
  const applied_min_qty = tier ? Number(tier.min_qty) : 1;

  return {
    ok: true as const,
    unit_price,
    applied_min_qty,
    stock,
    base_price: basePrice,
  };
}

/**
 * ============================
 * Cart helpers (D1)
 * ============================
 */
async function getOrCreateCart(env: Env, conversation_id: string) {
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

  return await env.DB.prepare(
    "SELECT id, conversation_id, created_at, updated_at FROM carts WHERE id = ?"
  )
    .bind(id)
    .first<any>();
}

async function getCart(env: Env, conversation_id: string) {
  const cart = await env.DB.prepare(
    "SELECT id, conversation_id, created_at, updated_at FROM carts WHERE conversation_id = ?"
  )
    .bind(conversation_id)
    .first<any>();

  if (!cart) return null;

  const items = await env.DB.prepare(`
    SELECT
      ci.product_id,
      ci.qty,
      p.name,
      p.description,
      p.stock,
      p.price AS base_price
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY p.id ASC
  `)
    .bind(cart.id)
    .all<any>();

  const line_items = [];
  for (const r of items.results) {
    const product_id = Number(r.product_id);
    const qty = Number(r.qty);

    const pricing = await getUnitPriceForQty(env, product_id, qty);
    if (!pricing.ok) {
      // si el producto dejó de estar disponible, igual devolvemos info mínima
      line_items.push({
        product_id,
        name: r.name,
        qty,
        unit_price: Number(r.base_price),
        applied_min_qty: 1,
        line_total: Number(r.base_price) * qty,
        stock: Number(r.stock),
        note: "pricing_fallback_base_price",
      });
      continue;
    }

    const unit_price = pricing.unit_price;
    line_items.push({
      product_id,
      name: r.name,
      qty,
      unit_price,
      applied_min_qty: pricing.applied_min_qty, // 1 / 50 / 100 / 200...
      line_total: unit_price * qty,
      stock: pricing.stock,
    });
  }

  const total = line_items.reduce((acc: number, x: any) => acc + Number(x.line_total || 0), 0);

  return {
    cart,
    items: line_items,
    total,
  };
}

/**
 * ============================
 * MCP server factory
 * ============================
 */
function buildMcpServer(env: Env) {
  const server = new McpServer({
    name: "Laburen.com MCP",
    version: "1.0.0",
  });

  const asText = (obj: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }],
  });

  /**
   *  list_products
   * - filtro opcional por texto (nombre/descripcion)
   * - devuelve max 50
   */
  server.tool(
    "list_products",
    "Lista productos disponibles. Filtro opcional 'q' (busca en nombre o descripción).",
    { q: z.string().optional() },
    async ({ q }) => {
      let sql = `
        SELECT
          id, name, description, price, stock,
          tipo_prenda, talla, color, categoria
        FROM products
        WHERE disponible = 1
      `;
      const params: any[] = [];

      if (q?.trim()) {
        sql += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${q.trim()}%`, `%${q.trim()}%`);
      }

      sql += ` ORDER BY id ASC LIMIT 50`;

      const result = await env.DB.prepare(sql).bind(...params).all<any>();
      return asText({ items: result.results, total: result.results.length });
    }
  );

  /**
   *  get_product_details
   * - detalle por ID + tiers (si existen)
   */
  server.tool(
    "get_product_details",
    "Obtiene detalle de un producto por id (incluye tiers de precio si existen).",
    { id: z.number().int().positive() },
    async ({ id }) => {
      const product = await env.DB.prepare(
        `SELECT
           id, name, description, price, stock,
           tipo_prenda, talla, color, categoria, disponible
         FROM products
         WHERE id = ?`
      )
        .bind(id)
        .first<any>();

      if (!product) return asText({ error: "not_found" });

      const tiers = await env.DB.prepare(
        `SELECT min_qty, price
         FROM product_price_tiers
         WHERE product_id = ?
         ORDER BY min_qty ASC`
      )
        .bind(id)
        .all<any>();

      return asText({ product, price_tiers: tiers.results });
    }
  );

  /**
   *  create_cart
   * - crea o reutiliza carrito por conversation_id
   * - devuelve view (con precios por volumen correctos)
   */
  server.tool(
    "create_cart",
    "Crea (o reutiliza) un carrito para un conversation_id y devuelve el estado del carrito.",
    { conversation_id: z.string().min(1) },
    async ({ conversation_id }) => {
      const cart = await getOrCreateCart(env, conversation_id);
      const view = await getCart(env, conversation_id);
      return asText({ cart, view });
    }
  );

  /**
   *  update_cart (EXTRA)
   * - add/set/remove
   * - valida stock
   * - devuelve view con unit_price correcto segun qty (tiers)
   */
  server.tool(
    "update_cart",
    "Actualiza el carrito: add/set/remove un producto (valida stock y aplica precios por volumen en el view).",
    {
      conversation_id: z.string().min(1),
      product_id: z.number().int().positive(),
      action: z.enum(["add", "set", "remove"]),
      qty: z.number().int().positive().optional(),
    },
    async ({ conversation_id, product_id, action, qty }) => {
      const cart = await getOrCreateCart(env, conversation_id);

      // valida producto disponible
      const product = await env.DB.prepare(
        "SELECT id, stock, disponible FROM products WHERE id = ?"
      )
        .bind(product_id)
        .first<any>();

      if (!product || Number(product.disponible) !== 1) {
        return asText({ error: "bad_request", message: "product_not_found_or_not_available" });
      }

      const existing = await env.DB.prepare(
        "SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?"
      )
        .bind(cart.id, product_id)
        .first<any>();

      if (action === "remove") {
        if (existing) {
          await env.DB.prepare("DELETE FROM cart_items WHERE id = ?")
            .bind(existing.id)
            .run();
        }
        return asText({ ok: true, view: await getCart(env, conversation_id) });
      }

      const nQty = Number(qty ?? 0);
      if (!Number.isFinite(nQty) || nQty <= 0) {
        return asText({ error: "bad_request", message: "qty must be positive" });
      }

      const newQty = action === "add" ? Number(existing?.qty ?? 0) + nQty : nQty;

      if (newQty > Number(product.stock)) {
        return asText({
          error: "bad_request",
          message: "insufficient_stock",
          stock: Number(product.stock),
          requested: newQty,
        });
      }

      if (existing) {
        await env.DB.prepare("UPDATE cart_items SET qty = ? WHERE id = ?")
          .bind(newQty, existing.id)
          .run();
      } else {
        await env.DB.prepare(
          "INSERT INTO cart_items (id, cart_id, product_id, qty) VALUES (?, ?, ?, ?)"
        )
          .bind(crypto.randomUUID(), cart.id, product_id, newQty)
          .run();
      }

      return asText({ ok: true, view: await getCart(env, conversation_id) });
    }
  );

  /**
   * (Opcional) ver carrito: útil para el agente
   */
  server.tool(
    "get_cart",
    "Obtiene el carrito (y sus items) para un conversation_id.",
    { conversation_id: z.string().min(1) },
    async ({ conversation_id }) => {
      const view = await getCart(env, conversation_id);
      if (!view) return asText({ error: "not_found" });
      return asText(view);
    }
  );

  return server;
}

/**
 * ============================
 * Worker
 * ============================
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    /**
     * ============================
     * MCP (Streamable HTTP) en /mcp
     * ============================
     */
    if (path === "/mcp" || path.startsWith("/mcp/")) {
      if (!isAuthorized(request, env)) return unauthorized();

      const server = buildMcpServer(env);

      const handler = createMcpHandler(server, {
        route: "/mcp",
        corsOptions: {
          origin: "*",
          methods: "GET, POST, OPTIONS",
          headers: "Content-Type, Authorization",
          maxAge: 86400,
        },
        // enableJsonResponse: true,
      });

      return handler(request, env, ctx);
    }

    // OPTIONS (endpoints HTTP normales)
    if (request.method === "OPTIONS") return handleOptions(request);

    /**
     * Healthcheck
     */
    if (path === "/" && request.method === "GET") {
      return json({
        status: "ok",
        service: "laburen-mcp",
        hint: "MCP endpoint is /mcp",
        tools: ["list_products", "get_product_details", "create_cart", "update_cart", "get_cart"],
      });
    }

    /**
     * ============================
     * HTTP REST (por si lo usás)
     * ============================
     * GET /products?q=...
     */
    if (path === "/products" && request.method === "GET") {
      const q = url.searchParams.get("q");

      let sql = `
        SELECT
          id, name, description, price, stock,
          tipo_prenda, talla, color, categoria
        FROM products
        WHERE disponible = 1
      `;
      const params: any[] = [];

      if (q?.trim()) {
        sql += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${q.trim()}%`, `%${q.trim()}%`);
      }

      sql += ` ORDER BY id ASC LIMIT 50`;

      const result = await env.DB.prepare(sql).bind(...params).all();
      return json({ items: result.results, total: result.results.length });
    }

    /**
     * GET /products/:id
     */
    const pm = path.match(/^\/products\/(\d+)$/);
    if (pm && request.method === "GET") {
      const id = Number(pm[1]);

      const product = await env.DB.prepare(
        `SELECT
           id, name, description, price, stock,
           tipo_prenda, talla, color, categoria, disponible
         FROM products
         WHERE id = ?`
      )
        .bind(id)
        .first<any>();

      if (!product) return json({ error: "not_found" }, 404);

      const tiers = await env.DB.prepare(
        `SELECT min_qty, price
         FROM product_price_tiers
         WHERE product_id = ?
         ORDER BY min_qty ASC`
      )
        .bind(id)
        .all<any>();

      return json({ product, price_tiers: tiers.results });
    }

    /**
     * POST /carts  { conversation_id }
     */
    if (path === "/carts" && request.method === "POST") {
      const body = await readJson<{ conversation_id?: string }>(request);
      if (!body.conversation_id) return badRequest("conversation_id is required");

      const cart = await getOrCreateCart(env, body.conversation_id);
      const view = await getCart(env, body.conversation_id);

      return json({ cart, view });
    }

    /**
     * GET /carts/:conversation_id
     */
    const cm = path.match(/^\/carts\/([^/]+)$/);
    if (cm && request.method === "GET") {
      const conversation_id = cm[1];
      const view = await getCart(env, conversation_id);
      if (!view) return json({ error: "not_found" }, 404);
      return json(view);
    }

    /**
     * POST /carts/update
     */
    if (path === "/carts/update" && request.method === "POST") {
      const body = await readJson<{
        conversation_id?: string;
        product_id?: number;
        action?: "add" | "set" | "remove";
        qty?: number;
      }>(request);

      if (!body.conversation_id) return badRequest("conversation_id is required");
      if (!body.product_id || !Number.isFinite(body.product_id)) return badRequest("product_id is required");
      if (!body.action) return badRequest("action is required");

      // Reutilizamos la lógica del tool
      const conversation_id = body.conversation_id;
      const cart = await getOrCreateCart(env, conversation_id);

      const product = await env.DB.prepare("SELECT id, stock, disponible FROM products WHERE id = ?")
        .bind(body.product_id)
        .first<any>();

      if (!product || Number(product.disponible) !== 1) return badRequest("product_not_found_or_not_available");

      const existing = await env.DB.prepare("SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?")
        .bind(cart.id, body.product_id)
        .first<any>();

      if (body.action === "remove") {
        if (existing) {
          await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(existing.id).run();
        }
        return json({ ok: true, view: await getCart(env, conversation_id) });
      }

      const qty = Number(body.qty ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) return badRequest("qty must be positive");

      const newQty = body.action === "add" ? Number(existing?.qty ?? 0) + qty : qty;

      if (newQty > Number(product.stock)) {
        return badRequest("insufficient_stock", { stock: Number(product.stock), requested: newQty });
      }

      if (existing) {
        await env.DB.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").bind(newQty, existing.id).run();
      } else {
        await env.DB.prepare("INSERT INTO cart_items (id, cart_id, product_id, qty) VALUES (?, ?, ?, ?)")
          .bind(crypto.randomUUID(), cart.id, body.product_id, newQty)
          .run();
      }

      return json({ ok: true, view: await getCart(env, conversation_id) });
    }

    return notFound(url.pathname);
  },
};
