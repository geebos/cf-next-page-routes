import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, describe, it } from "node:test";

import { stringify as stringifyYaml } from "yaml";

import type { CompileResult } from "./compile";
import { watchLocales } from "./watch";

const TEST_ROOT = path.join(__dirname, "..", ".test-tmp-watch");

after(() => {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
});

async function waitFor(condition: () => boolean, timeoutMs = 6000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("timed out waiting for watcher recompile");
}

describe("watchLocales", () => {
  it("recompiles on changes and keeps the last good output on errors", async (t) => {
    fs.mkdirSync(TEST_ROOT, { recursive: true });
    const dir = fs.mkdtempSync(path.join(TEST_ROOT, "run-"));
    const localesDir = path.join(dir, "locales");
    const outDir = path.join(dir, "generated");
    const localeFile = path.join(localesDir, "public", "common", "_common.yml");
    const generatedFile = path.join(outDir, "public", "index.ts");

    fs.mkdirSync(path.dirname(localeFile), { recursive: true });
    fs.writeFileSync(localeFile, stringifyYaml({ title: { en: "First" } }));

    const compiled: CompileResult[] = [];
    const errors: string[] = [];
    const close = watchLocales(
      { localesDir, outDir },
      {
        onCompile: (result) => compiled.push(result),
        onError: (error) => errors.push(error.message),
      },
    );
    t.after(close);

    assert.equal(compiled.length, 1);
    assert.match(fs.readFileSync(generatedFile, "utf8"), /"First"/);

    // macOS fsevents watchers are armed asynchronously.
    await new Promise((resolve) => setTimeout(resolve, 150));

    fs.writeFileSync(localeFile, stringifyYaml({ title: { en: "Second" } }));
    await waitFor(() => fs.readFileSync(generatedFile, "utf8").includes("Second"));

    fs.writeFileSync(localeFile, "title: [unclosed\n");
    await waitFor(() => errors.length > 0);
    assert.match(fs.readFileSync(generatedFile, "utf8"), /"Second"/);

    fs.writeFileSync(localeFile, stringifyYaml({ title: { en: "Third" } }));
    await waitFor(() => fs.readFileSync(generatedFile, "utf8").includes("Third"));
  });
});
