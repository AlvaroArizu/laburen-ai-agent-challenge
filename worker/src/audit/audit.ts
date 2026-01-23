// src/audit/audit.ts

import type { Env } from "../db/client";
import { truthy } from "../utils/text";

export function logConsole(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}

/**
 * Audit logging (Workers logs + optional D1 request_logs)
 */
export async function writeAuditLog(
  env: Env,
  row: {
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
  }
) {
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
