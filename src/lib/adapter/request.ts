import { invoke, isTauri } from "@tauri-apps/api/core";

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | ArrayBuffer | Uint8Array;
}

type ProxyResponse = {
  status: number;
  /** Ordered header pairs; multi-value headers (e.g. Set-Cookie) are separate entries. */
  headers: [string, string][];
  body: number[];
};

// Required null-body statuses per WHATWG / Fetch; 101/103 optional and safe to include.
const NULL_BODY = new Set([101, 103, 204, 205, 304]);

function toBytes(body: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (typeof body === "string") return new TextEncoder().encode(body);
  if (body instanceof Uint8Array) return body;
  return new Uint8Array(body); // ArrayBuffer
}

/**
 * Transparent HTTP request routed through the Rust `proxy` command.
 * Only available in the Tauri environment; throws otherwise.
 *
 * Proxy failures reject via invoke — never encoded as HTTP status 0.
 */
export async function request(
  url: string,
  init?: RequestOptions,
): Promise<Response> {
  if (!isTauri()) {
    throw new Error("request() is only available in the Tauri environment");
  }

  const res = await invoke<ProxyResponse>("proxy", {
    args: {
      url,
      method: init?.method,
      headers: init?.headers,
      body: init?.body != null ? Array.from(toBytes(init.body)) : undefined,
    },
  });

  // 204/205/304 (and 101/103) forbid a body; pass null even if upstream sent one.
  const body = NULL_BODY.has(res.status) ? null : new Uint8Array(res.body);

  const headers = new Headers();
  for (const [k, v] of res.headers) {
    headers.append(k, v);
  }

  return new Response(body, {
    status: res.status,
    headers,
  });
}
