// src/chatwoot/labels.ts
import type { Env } from "../db/client";

type CwLabelsResponse = { payload?: string[] };

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export async function cwGetLabels(env: Env, conversationId: string): Promise<string[]> {
  const base = normalizeBaseUrl(env.CHATWOOT_BASE_URL);
  const url = `${base}/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels`;

  const r = await fetch(url, {
    headers: { api_access_token: env.CHATWOOT_API_TOKEN },
  });

  if (!r.ok) throw new Error(`Chatwoot GET labels failed: ${r.status}`);

  const data = (await r.json()) as CwLabelsResponse;
  return (data.payload ?? []) as string[];
}

export async function cwSetLabels(env: Env, conversationId: string, labels: string[]) {
  const base = normalizeBaseUrl(env.CHATWOOT_BASE_URL);
  const url = `${base}/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      api_access_token: env.CHATWOOT_API_TOKEN,
    },
    body: JSON.stringify({ labels }),
  });

  if (!r.ok) throw new Error(`Chatwoot POST labels failed: ${r.status}`);
}

export async function cwAddLabels(env: Env, conversationId: string, toAdd: string[]) {
  const current = await cwGetLabels(env, conversationId);
  const merged = Array.from(new Set([...current, ...toAdd]));
  await cwSetLabels(env, conversationId, merged);
  return merged;
}
