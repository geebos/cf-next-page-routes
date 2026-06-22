import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
} from "@/shared/schemas";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""

// plugin-http uses Tauri's IPC (window.__TAURI_INTERNALS__.invoke),
// which doesn't exist in a regular browser. Fall back to native fetch
// there so the same code works in `next dev` and the Tauri webview.
const fetch = function (input: string, init?: RequestInit): Promise<Response> {
  const url = BASE_URL + input;
  return isTauri() ? tauriFetch(url, init) : window.fetch(url, init);
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { code?: number; message?: string; data?: unknown };
    return new ApiError(body.message ?? "请求失败", body.code ?? res.status);
  } catch {
    return new ApiError("请求失败", res.status);
  }
}

export async function listTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Todo[];
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Todo;
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw await parseError(res);
  // 204 no body
}
