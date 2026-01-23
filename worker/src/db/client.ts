// src/db/client.ts

export interface Env {
  DB: D1Database;

  // Auth
  MCP_AUTH_TOKEN?: string;
  MCP_AUTH_DISABLED?: string; // "true" para desactivar auth en dev

  // Logging/Audit
  LOG_TO_DB?: string; // "true" para guardar logs en D1
  LOG_BODY_MAX?: string; // por ej "1500"
}
