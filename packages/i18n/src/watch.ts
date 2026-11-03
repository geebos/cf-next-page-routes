import fs from "node:fs";
import path from "node:path";

import {
  compileLocales,
  DEFAULT_COMPILE_OPTIONS,
  type CompileOptions,
  type CompileResult,
} from "./compile";

export type WatchLocalesCallbacks = {
  onCompile?: (result: CompileResult) => void;
  onError?: (error: Error) => void;
};

const DEBOUNCE_MS = 100;

/**
 * Compile once, then watch the locale sources for changes.
 * Compile errors are reported through `onError` and keep the last good output.
 */
export function watchLocales(
  options: Partial<CompileOptions> = {},
  callbacks: WatchLocalesCallbacks = {},
): () => void {
  const localesDir = options.localesDir ?? DEFAULT_COMPILE_OPTIONS.localesDir;

  const watchers = new Map<string, fs.FSWatcher>();
  let timer: NodeJS.Timeout | undefined;
  let closed = false;

  function compile(): void {
    try {
      const result = compileLocales(options);
      callbacks.onCompile?.(result);
    } catch (error) {
      callbacks.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  function refreshWatchers(): void {
    watchTree(localesDir, `dir:${localesDir}`);
  }

  function schedule(): void {
    if (closed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      refreshWatchers();
      compile();
    }, DEBOUNCE_MS);
  }

  function addWatcher(key: string, dir: string, listener: fs.WatchListener<string>) {
    if (watchers.has(key)) return;
    try {
      const watcher = fs.watch(dir, listener);
      watcher.on("error", () => {
        watcher.close();
        watchers.delete(key);
      });
      watchers.set(key, watcher);
    } catch {
      // Directory disappeared between readdir and watch; the next refresh retries.
    }
  }

  function watchTree(dir: string, key: string): void {
    let entries: fs.Dirent[];
    try {
      if (!fs.statSync(dir).isDirectory()) return;
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    addWatcher(key, dir, () => schedule());

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const child = path.join(dir, entry.name);
        watchTree(child, `dir:${child}`);
      }
    }
  }

  refreshWatchers();
  compile();

  return () => {
    closed = true;
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    for (const watcher of watchers.values()) watcher.close();
    watchers.clear();
  };
}
