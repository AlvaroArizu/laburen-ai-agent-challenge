// src/index.ts

import { createMcpHandler } from "agents/mcp";

import type { Env } from "./db/client";
export type { Env } from "./db/client";

import { jsonResponse, handleOptions } from "./utils/cors";
import { nowIso, truthy, clamp, safePreview } from "./utils/text";
import { writeAuditLog, logConsole } from "./audit/audit";
import { buildMcpServer } from "./mcp-server/server";
import { listProductsDb } from "./db/products";


type ApiOk<T> = { ok: true; data: T; request_id: string };
type ApiErr = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
  request_id: string;
};

/**
 * Auth (prod ON, dev OFF via MCP_AUTH_DISABLED)
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
 * Wrap helper: creates request_id and measures duration
 */
function createReqContext(request: Request) {
  const request_id = crypto.randomUUID();
  const started = Date.now();
  const url = new URL(request.url);
  return { request_id, started, url, path: url.pathname, method: request.method };
}

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

        // DECLARACIONES
        let toolName: string | null = null;
        let conversation_id: string | null = null;
        let input_preview: string | null = null;
        let output_preview: string | null = null;

        // INTENTAR LEER BODY SIN CONSUMIR REQUEST
        try {
          if (request.method === "POST") {
            const clone = request.clone();
            const ct = (clone.headers.get("content-type") || "").toLowerCase();
            if (ct.includes("application/json")) {
              const body: any = await clone.json();

              toolName = body?.params?.name || body?.params?.tool || body?.tool || null;

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

        // CAPTURAR OUTPUT PREVIEW (evitar SSE/stream)
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
              "add_labels",
              "handoff_to_human",
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

        const data = await listProductsDb(env, {
          q,
          disponible,
          in_stock,
          talla,
          categoria,
          tipo_prenda,
          color,
          match,
          limit,
          offset,
          sort: "id",
          order: "asc",
        });

        const out: ApiOk<any> = {
          ok: true,
          request_id: rc.request_id,
          data,
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
