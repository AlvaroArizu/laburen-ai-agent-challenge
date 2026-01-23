// src/mcp-server/result.ts

export function mcpResult(data: unknown, isError = false) {
  const text = JSON.stringify(data, null, 2);
  return {
    isError,
    structuredContent: data,
    content: [{ type: "text" as const, text }],
  } as any;
}
