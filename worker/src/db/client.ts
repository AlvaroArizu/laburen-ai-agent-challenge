export interface Env {
  DB: D1Database;

  MCP_AUTH_TOKEN?: string;
  MCP_AUTH_DISABLED?: string;

  LOG_BODY_MAX?: string;

  // Chatwoot
  CHATWOOT_BASE_URL: string;
  CHATWOOT_ACCOUNT_ID: string;
  CHATWOOT_API_TOKEN: string;
}

