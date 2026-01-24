// src/mcp-server/server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type { Env } from "../db/client";
import { mcpResult } from "./result";
import {
  listProductsSchema,
  listFacetsSchema,
  getProductDetailsSchema,
  quotePriceSchema,
  getProductsByIdsSchema,
  createCartSchema,
  updateCartSchema,
  getCartSchema,
  validateCartSchema,
} from "./schemas";

import { listProductsDb, listFacetsDb, getProductById, getPriceTiers, getProductsByIdsDb } from "../db/products";
import { getUnitPriceForQty } from "../db/pricing";
import { getOrCreateCart, getCart, validateCart } from "../db/cart";

import { cwAddLabels } from "../chatwoot/labels";

export function buildMcpServer(env: Env) {
  const server = new McpServer({
    name: "Laburen.com MCP",
    version: "1.2.0",
  });

  /**
   * list_products
   */
  server.registerTool(
    "list_products",
    {
      title: "List Products",
      description:
        "Lista productos con filtros (q, disponible, in_stock, talla/talle, categoria/estilo, tipo_prenda/prenda, color) + match exact|contains + paginación (limit/offset) y total real.",
      inputSchema: listProductsSchema,
    },
    async (input: any) => {
      const conversation_id = (input.conversation_id || "").trim() || null;

      const data = await listProductsDb(env, input);

      return mcpResult({
        ok: true,
        filters: {
          ...data.filters,
          aliases: {
            talle: input.talle ? true : undefined,
            estilo: input.estilo ? true : undefined,
            prenda: input.prenda ? true : undefined,
          },
        },
        paging: data.paging,
        items: data.items,
        note_for_agents:
          "Definiciones: disponible=flag del catálogo (vendible). in_stock=stock real (stock>0). " +
          "Si el usuario dice 'en stock' normalmente significa vendible+stock => usar disponible='si' e in_stock='si'. " +
          "Si pide 'aunque no esté disponible', usar disponible='all' e in_stock='si'. " +
          "Para 'todos', usar disponible='all' e in_stock='all'.",
        conversation_id: conversation_id || undefined,
      });
    }
  );

  /**
   * list_facets
   */
  server.registerTool(
    "list_facets",
    {
      title: "List Facets",
      description:
        "Devuelve valores existentes del catálogo para desambiguar: tipo_prenda (prenda) vs categoria (estilo), además de talles y colores. Incluye conteos y stock.",
      inputSchema: listFacetsSchema,
    },
    async (input: any) => {
      const data = await listFacetsDb(env, input);

      return mcpResult({
        ok: true,
        field_definitions: {
          tipo_prenda: "Tipo de prenda (ej: Camiseta, Sudadera, Pantalón).",
          categoria: "Estilo/categoría (ej: Casual, Deportivo, Formal).",
          talla: "Talle (ej: S, M, L, XL).",
          color: "Color (ej: Negro, Blanco).",
        },
        filters: data.filters,
        facets: data.facets,
        note_for_agents:
          "Si el usuario pide 'categorías' y no especifica, preguntá: ¿te referís a tipo_prenda (prenda) o a categoria (estilo)? Usá list_facets para mostrar opciones reales.",
      });
    }
  );

  /**
   * get_product_details
   */
  server.registerTool(
    "get_product_details",
    {
      title: "Get Product Details",
      description:
        "Obtiene detalle de un producto por id. Incluye tiers de precio si existen. Opcional: qty para devolver precio aplicado.",
      inputSchema: getProductDetailsSchema,
    },
    async ({ id, qty }: { id: number; qty?: number }) => {
      const product = await getProductById(env, id);
      if (!product) {
        return mcpResult({ ok: false, error: { code: "not_found", message: "Producto no encontrado" } }, true);
      }

      const price_tiers = await getPriceTiers(env, id);

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

      return mcpResult({ ok: true, product, price_tiers, quote });
    }
  );

  /**
   * quote_price
   */
  server.registerTool(
    "quote_price",
    {
      title: "Quote Price",
      description:
        "Cotiza el precio para un producto y una cantidad (aplica tiers desde backend). Devuelve unit_price aplicado y total.",
      inputSchema: quotePriceSchema,
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
      inputSchema: getProductsByIdsSchema,
    },
    async ({ ids }: { ids: number[] }) => {
      const { items, missing } = await getProductsByIdsDb(env, ids);
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
      inputSchema: createCartSchema,
    },
    async ({ conversation_id }: { conversation_id: string }) => {
      const cart = await getOrCreateCart(env, conversation_id);
      const view = await getCart(env, conversation_id);

      // ✅ etiquetas automáticas
      await cwAddLabels(env, conversation_id, ["carrito_activo"]);
      const hasItems = Array.isArray((view as any)?.items) && (view as any).items.length > 0;
      if (hasItems) await cwAddLabels(env, conversation_id, ["producto_agregado"]);

      return mcpResult({ ok: true, cart, view });
    }
  );

  /**
   * update_cart
   */
  server.registerTool(
    "update_cart",
    {
      title: "Update Cart",
      description:
        "Actualiza el carrito: add/set/remove/clear. Soporta batch con items[]. Valida stock y devuelve view actualizado.",
      inputSchema: updateCartSchema,
    },
    async (input: any) => {
      const { conversation_id, action } = input;
      const cart = await getOrCreateCart(env, conversation_id);

      if (action === "clear") {
        await env.DB.prepare("DELETE FROM cart_items WHERE cart_id = ?").bind(cart.id).run();

        // ✅ al vaciar: seguimos marcando carrito_activo (hubo compra) y quitamos nada (mergea)
        await cwAddLabels(env, conversation_id, ["carrito_activo"]);

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

        // set en 0 => remove
        if (action === "set" && qty === 0) {
          if (existing) {
            await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(existing.id).run();
          }
          continue;
        }

        // add con 0 => no-op
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

      // ✅ etiquetas automáticas (según labels reales que creaste)
      const labelsToAdd: string[] = ["carrito_activo"];

      if (action === "add") {
        labelsToAdd.push("producto_agregado", "interes_en_comprar");
      }

      const hasItems = Array.isArray((view as any)?.items) && (view as any).items.length > 0;
      if (hasItems) labelsToAdd.push("producto_agregado");

      await cwAddLabels(env, conversation_id, labelsToAdd);

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
      inputSchema: getCartSchema,
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
      inputSchema: validateCartSchema,
    },
    async ({ conversation_id }: { conversation_id: string }) => {
      const res = await validateCart(env, conversation_id);
      if (!res.ok) return mcpResult({ ok: false, error: { code: res.error, message: "Carrito no encontrado" } }, true);

      // Si querés marcar interés/estado al validar:
      await cwAddLabels(env, conversation_id, ["carrito_activo"]);

      return mcpResult({ ok: true, issues: res.issues, view: res.view });
    }
  );

  /**
   * add_labels (manual)
   */
  server.tool(
    "add_labels",
    "Agrega labels de Chatwoot a la conversación (no pisa: mergea).",
    {
      conversation_id: z.string(),
      labels: z.array(z.string()).min(1),
    },
    async ({ conversation_id, labels }) => {
      const merged = await cwAddLabels(env, conversation_id, labels);
      return { content: [{ type: "text", text: `OK. Labels ahora: ${merged.join(", ")}` }] };
    }
  );

  /**
   * handoff_to_human (derivación real)
   */
  server.tool(
    "handoff_to_human",
    "Deriva a un humano: aplica label derivar_a_humano (y devuelve texto de handoff).",
    {
      conversation_id: z.string(),
      motivo: z.string().optional(),
    },
    async ({ conversation_id, motivo }) => {
      await cwAddLabels(env, conversation_id, ["derivar_a_humano"]);
      const msg = `Listo 😊 Ya te derivo con un operador humano.${motivo ? ` Motivo: ${motivo}` : ""}`;
      return { content: [{ type: "text", text: msg }] };
    }
  );

  return server;
}
