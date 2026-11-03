import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, describe, it } from "node:test";

import { stringify as stringifyYaml } from "yaml";

import { compileLocales, LocaleCompileError } from "./compile";
import type { Messages } from "./types";

const TEST_ROOT = path.join(__dirname, "..", ".test-tmp");

after(() => {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
});

type FixtureFile = string | Record<string, unknown>;

function leaf(en: string, zhCN?: string): Record<string, string> {
  return zhCN === undefined ? { en } : { en, "zh-CN": zhCN };
}

function setup(files: Record<string, FixtureFile>) {
  fs.mkdirSync(TEST_ROOT, { recursive: true });
  const dir = fs.mkdtempSync(path.join(TEST_ROOT, "run-"));
  const localesDir = path.join(dir, "locales");
  const outDir = path.join(dir, "generated");

  for (const [relativePath, content] of Object.entries(files)) {
    const file = path.join(localesDir, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      typeof content === "string" ? content : stringifyYaml(content),
    );
  }

  return { localesDir, outDir };
}

function readGeneratedFile(outDir: string, relativePath: string): string {
  return fs.readFileSync(path.join(outDir, relativePath), "utf8");
}

function readResources(
  outDir: string,
  visibility: "public" | "private",
): Record<string, Record<string, Messages>> {
  const source = readGeneratedFile(outDir, `${visibility}/index.ts`);
  const exportName =
    visibility === "public" ? "PUBLIC_RESOURCES" : "PRIVATE_RESOURCES";
  const match = source.match(
    new RegExp(`export const ${exportName}: LocaleResources = ([\\s\\S]*);\\n$`),
  );
  assert.ok(match, `missing ${exportName} in generated module`);
  return JSON.parse(match[1]!) as Record<string, Record<string, Messages>>;
}

function compileError(action: () => void): LocaleCompileError {
  try {
    action();
  } catch (error) {
    assert.ok(error instanceof LocaleCompileError, String(error));
    return error;
  }
  assert.fail("expected compileLocales to throw");
}

describe("compileLocales path mapping", () => {
  it("maps namespace index, file stems, nested dirs, and merges files", (t) => {
    const fixture = setup({
      "public/home/_home.yml": { title: leaf("Home", "首页") },
      "public/home/hero.yml": { title: leaf("Hero", "主标题") },
      "public/home/account.yml": { name: leaf("Account", "账户") },
      "public/home/account/profile.yml": {
        name: leaf("Profile", "资料"),
      },
      "public/demo/buttons.yml": { title: leaf("Buttons", "按钮") },
      "public/demo/buttons/row.yml": {
        variants: leaf("Variants", "变体"),
      },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const result = compileLocales(fixture);
    assert.equal(result.filesScanned, 6);
    assert.deepEqual(result.publicNamespaces, ["demo", "home"]);
    assert.deepEqual(result.privateNamespaces, []);

    const resources = readResources(fixture.outDir, "public");
    assert.deepEqual(resources.en?.home, {
      title: "Home",
      hero: { title: "Hero" },
      account: { name: "Account", profile: { name: "Profile" } },
    });
    assert.deepEqual(resources["zh-CN"]?.home, {
      title: "首页",
      hero: { title: "主标题" },
      account: { name: "账户", profile: { name: "资料" } },
    });
    assert.deepEqual(resources.en?.demo, {
      buttons: { title: "Buttons", row: { variants: "Variants" } },
    });
  });

  it("supports arbitrary nesting depth", (t) => {
    const fixture = setup({
      "public/common/a/b/c/deep.yml": { value: leaf("Deep") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    compileLocales(fixture);
    const resources = readResources(fixture.outDir, "public");
    assert.deepEqual(resources.en?.common, {
      a: { b: { c: { deep: { value: "Deep" } } } },
    });
  });
});

describe("compileLocales fallback and visibility", () => {
  it("omits untranslated keys and empty namespaces, keeping default locale", (t) => {
    const fixture = setup({
      "public/common/_common.yml": {
        onlyEn: leaf("Only EN"),
        both: leaf("Both", "两者"),
      },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    compileLocales(fixture);
    const resources = readResources(fixture.outDir, "public");
    assert.deepEqual(resources.en?.common, {
      onlyEn: "Only EN",
      both: "Both",
    });
    assert.deepEqual(resources["zh-CN"]?.common, { both: "两者" });
  });

  it("keeps private resources and manifest names separate from public", (t) => {
    const sentinel = "PRIVATE_I18N_SENTINEL_VALUE";
    const fixture = setup({
      "public/common/_common.yml": { siteName: leaf("Example") },
      "private/admin/_admin.yml": {
        title: leaf("Admin"),
        description: leaf(sentinel),
      },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const result = compileLocales(fixture);
    assert.deepEqual(result.publicNamespaces, ["common"]);
    assert.deepEqual(result.privateNamespaces, ["admin"]);

    const manifest = readGeneratedFile(fixture.outDir, "manifest.ts");
    assert.match(manifest, /PUBLIC_NAMESPACES = \["common"\] as const;/);
    assert.match(manifest, /PRIVATE_NAMESPACES = \["admin"\] as const;/);
    assert.equal(manifest.includes(sentinel), false);

    const publicSource = readGeneratedFile(fixture.outDir, "public/index.ts");
    assert.equal(publicSource.includes(sentinel), false);

    const privateSource = readGeneratedFile(fixture.outDir, "private/index.ts");
    assert.equal(privateSource.includes(sentinel), true);

    const resources = readResources(fixture.outDir, "private");
    assert.equal(resources.en?.admin?.title, "Admin");
  });

  it("sorts namespaces and keys deterministically", (t) => {
    const fixture = setup({
      "public/zeta/_zeta.yml": { b: leaf("b"), a: leaf("a") },
      "public/alpha/_alpha.yml": { z: leaf("z"), y: leaf("y") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    compileLocales(fixture);
    const resources = readResources(fixture.outDir, "public");
    assert.deepEqual(Object.keys(resources.en ?? {}), ["alpha", "zeta"]);
    assert.deepEqual(Object.keys(resources.en?.alpha ?? {}), ["y", "z"]);
  });
});

describe("compileLocales conflicts", () => {
  it("rejects a string leaf that is used as an object prefix", (t) => {
    const fixture = setup({
      "public/home/_home.yml": { hero: leaf("Hero") },
      "public/home/hero.yml": { title: leaf("Hero title") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    assert.match(error.message, /home\.hero/);
    assert.match(error.message, /string vs object/);
    assert.match(error.message, /_home\.yml/);
  });

  it("rejects an object nested below a string leaf", (t) => {
    const fixture = setup({
      "public/home/hero/task.yml": { item: leaf("Item") },
      "public/home/hero/task/item.yml": { value: leaf("Value") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    assert.match(error.message, /string vs object/);
  });

  it("rejects a namespace in both public and private", (t) => {
    const fixture = setup({
      "public/admin/_admin.yml": { title: leaf("Public admin") },
      "private/admin/_admin.yml": { title: leaf("Private admin") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    assert.match(error.message, /namespace "admin" exists in both/);
  });
});

describe("compileLocales validation", () => {
  it("collects all file and key errors with paths", (t) => {
    const fixture = setup({
      "public/common/_common.yml": {
        unknown: { fr: "Bonjour" },
        empty: {},
        nonString: { en: 1 },
        "bad.key": { en: "x" },
        missingDefault: { "zh-CN": "中文" },
      },
      "public/root.yml": { title: leaf("Root") },
      "public/home/_hero.yml": { title: leaf("Wrong index") },
      "public/demo/navigation.v2.yml": { title: leaf("Dotted") },
      "public/empty/README.md": "# no locale here",
      "shared/home/hero.yml": { title: leaf("Unknown visibility") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    const messages = error.errors.join("\n");

    assert.ok(error.errors.length >= 8, messages);
    assert.match(messages, /common\/_common\.yml: key "common\.unknown" unknown locale "fr"/);
    assert.match(messages, /common\/_common\.yml: key "common\.empty" locale map must not be empty/);
    assert.match(messages, /common\/_common\.yml: key "common\.nonString" locale "en" must be a string/);
    assert.match(messages, /common\/_common\.yml: invalid key "bad\.key"/);
    assert.match(messages, /common\/_common\.yml: key "common\.missingDefault" is missing default locale "en"/);
    assert.match(messages, /root\.yml: locale files must live inside a namespace directory/);
    assert.match(messages, /home\/_hero\.yml: .*must be named "_home\.yml"/);
    assert.match(messages, /demo\/navigation\.v2\.yml: invalid file name/);
    assert.match(messages, /empty\/README\.md|namespace "empty" \(public\) has no leaves/);
    assert.match(messages, /unknown directory at locales root/);
  });

  it("rejects invalid YAML and non-object file content", (t) => {
    const fixture = setup({
      "public/common/broken.yml": "title: [unclosed\n",
      "public/todo/_todo.yml": "[]",
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    assert.match(error.message, /common\/broken\.yml/);
    assert.match(error.message, /todo\/_todo\.yml: file content must be an object/);
  });

  it("rejects a YAML file that is not a mapping", (t) => {
    const fixture = setup({ "public/common/_common.yml": "- one\n- two\n" });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    const error = compileError(() => compileLocales(fixture));
    assert.match(error.message, /_common\.yml: file content must be an object/);
  });
});

describe("compileLocales output behavior", () => {
  it("does not rewrite unchanged files", (t) => {
    const fixture = setup({
      "public/common/_common.yml": { title: leaf("Title") },
    });
    t.after(() => fs.rmSync(fixture.localesDir, { recursive: true, force: true }));

    compileLocales(fixture);
    const generatedFile = path.join(fixture.outDir, "public", "index.ts");
    const firstContent = fs.readFileSync(generatedFile, "utf8");
    const firstStat = fs.statSync(generatedFile);

    const start = Date.now();
    while (Date.now() - start < 20) {
      // wait for a measurable mtime change window
    }
    compileLocales(fixture);

    assert.equal(fs.readFileSync(generatedFile, "utf8"), firstContent);
    assert.equal(fs.statSync(generatedFile).mtimeMs, firstStat.mtimeMs);

    const tempFiles = fs
      .readdirSync(path.join(fixture.outDir, "public"))
      .filter((name) => name.endsWith(".tmp"));
    assert.deepEqual(tempFiles, []);
  });

});
