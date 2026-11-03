import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import { getI18nConfig } from "./config";
import {
  isValidSegment,
  LOCALE_FILE_EXTENSION,
  parseLocaleFilePath,
  type LocaleVisibility,
} from "./paths";
import type { Messages } from "./types";

export type CompileOptions = {
  localesDir: string;
  outDir: string;
};

export type CompileResult = {
  publicNamespaces: string[];
  privateNamespaces: string[];
  filesScanned: number;
};

const PACKAGE_DIR = path.resolve(__dirname, "..");

export const DEFAULT_COMPILE_OPTIONS: CompileOptions = {
  localesDir: path.join(PACKAGE_DIR, "locales"),
  outDir: path.join(PACKAGE_DIR, "generated"),
};

export class LocaleCompileError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(
      [
        `i18n: ${errors.length} error(s)`,
        ...errors.map((error) => `  - ${error}`),
      ].join("\n"),
    );
    this.name = "LocaleCompileError";
    this.errors = errors;
  }
}

type LocaleSettings = {
  locales: string[];
  defaultLocale: string;
};

type LocaleFile = {
  relativePath: string;
  visibility: LocaleVisibility;
  namespace: string;
  containerPath: string[];
};

type TreeNode = {
  file: string;
  leafFile?: string;
  leafValues?: Record<string, string>;
  children: Map<string, TreeNode>;
};

type NamespaceTree = {
  visibility: LocaleVisibility;
  namespace: string;
  root: TreeNode;
  leafCount: number;
};

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function createNode(file: string): TreeNode {
  return { file, children: new Map() };
}

function readConfig(): LocaleSettings {
  const { locales, defaultLocale } = getI18nConfig();
  const errors: string[] = [];

  if (locales.length === 0) {
    errors.push('i18n config: "locales" must not be empty');
  }
  if (new Set(locales).size !== locales.length) {
    errors.push('i18n config: "locales" must not contain duplicates');
  }
  if (!(locales as readonly string[]).includes(defaultLocale)) {
    errors.push(
      `i18n config: defaultLocale "${defaultLocale}" is not in locales`,
    );
  }

  if (errors.length > 0) {
    throw new LocaleCompileError(errors);
  }

  return { locales: [...locales], defaultLocale };
}

function collectLocaleFiles(
  localesDir: string,
  errors: string[],
): {
  files: LocaleFile[];
  namespaces: Record<LocaleVisibility, Set<string>>;
} {
  const files: LocaleFile[] = [];
  const namespaces: Record<LocaleVisibility, Set<string>> = {
    public: new Set(),
    private: new Set(),
  };

  let rootEntries: fs.Dirent[];
  try {
    rootEntries = fs.readdirSync(localesDir, { withFileTypes: true });
  } catch {
    errors.push(`${localesDir}: locales directory not found`);
    return { files, namespaces };
  }

  for (const entry of [...rootEntries].sort((a, b) =>
    compareStrings(a.name, b.name),
  )) {
    if (entry.isDirectory()) {
      if (entry.name !== "public" && entry.name !== "private") {
        errors.push(`${entry.name}: unknown directory at locales root`);
        continue;
      }
      const visibility = entry.name;
      collectVisibility(
        path.join(localesDir, visibility),
        visibility,
        visibility,
        files,
        namespaces,
        errors,
      );
    } else if (entry.name.endsWith(LOCALE_FILE_EXTENSION)) {
      errors.push(
        `${entry.name}: locale files must live under locales/public/<namespace>/ or locales/private/<namespace>/`,
      );
    }
  }

  return { files, namespaces };
}

function readEntries(dir: string, relDir: string, errors: string[]) {
  try {
    return [...fs.readdirSync(dir, { withFileTypes: true })].sort((a, b) =>
      compareStrings(a.name, b.name),
    );
  } catch {
    errors.push(`${relDir}: cannot read directory`);
    return [];
  }
}

function collectVisibility(
  dir: string,
  relDir: string,
  visibility: LocaleVisibility,
  files: LocaleFile[],
  namespaces: Record<LocaleVisibility, Set<string>>,
  errors: string[],
): void {
  for (const entry of readEntries(dir, relDir, errors)) {
    if (entry.isDirectory()) {
      const namespace = entry.name;
      if (!isValidSegment(namespace) || namespace.startsWith("_")) {
        errors.push(`${relDir}/${namespace}: invalid namespace name`);
        continue;
      }
      namespaces[visibility].add(namespace);
      walkNamespace(
        path.join(dir, namespace),
        `${relDir}/${namespace}`,
        visibility,
        namespace,
        files,
        errors,
      );
    } else if (entry.name.endsWith(LOCALE_FILE_EXTENSION)) {
      errors.push(
        `${relDir}/${entry.name}: locale files must live inside a namespace directory`,
      );
    }
  }
}

function walkNamespace(
  dir: string,
  relDir: string,
  visibility: LocaleVisibility,
  namespace: string,
  files: LocaleFile[],
  errors: string[],
): void {
  for (const entry of readEntries(dir, relDir, errors)) {
    if (entry.isDirectory()) {
      const subDir = entry.name;
      if (!isValidSegment(subDir) || subDir.startsWith("_")) {
        errors.push(`${relDir}/${subDir}: invalid directory name`);
        continue;
      }
      walkNamespace(
        path.join(dir, subDir),
        `${relDir}/${subDir}`,
        visibility,
        namespace,
        files,
        errors,
      );
    } else if (entry.name.endsWith(LOCALE_FILE_EXTENSION)) {
      const relativePath = `${relDir}/${entry.name}`;
      try {
        const parsed = parseLocaleFilePath(relativePath);
        files.push({ relativePath, ...parsed });
      } catch (error) {
        errors.push(`${relativePath}: ${errorMessage(error)}`);
      }
    }
  }
}

function validateLocaleMap(
  value: unknown,
  locales: readonly string[],
  defaultLocale: string,
): Record<string, string> | string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return ["must be a locale map"];
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return ["locale map must not be empty"];
  }

  const errors: string[] = [];
  const result: Record<string, string> = {};

  for (const [locale, text] of entries) {
    if (!locales.includes(locale)) {
      errors.push(`unknown locale "${locale}"`);
      continue;
    }
    if (typeof text !== "string") {
      errors.push(`locale "${locale}" must be a string`);
      continue;
    }
    result[locale] = text;
  }

  if (!Object.prototype.hasOwnProperty.call(value, defaultLocale)) {
    errors.push(`is missing default locale "${defaultLocale}"`);
  }

  return errors.length > 0 ? errors : result;
}

function insertLeaf(
  tree: NamespaceTree,
  segments: string[],
  values: Record<string, string>,
  file: string,
  errors: string[],
): void {
  let node = tree.root;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]!;
    const isLast = index === segments.length - 1;
    const fullKey = [tree.namespace, ...segments].join(".");
    const existing = node.children.get(segment);

    if (isLast) {
      if (existing?.leafFile) {
        errors.push(
          `${file}: key "${fullKey}" also defined in ${existing.leafFile}`,
        );
        return;
      }
      if (existing) {
        errors.push(
          `${file}: key "${fullKey}" conflicts with ${existing.file} (string vs object)`,
        );
        return;
      }
      node.children.set(segment, {
        file,
        leafFile: file,
        leafValues: values,
        children: new Map(),
      });
      tree.leafCount += 1;
      return;
    }

    if (existing?.leafFile) {
      errors.push(
        `${file}: key "${fullKey}" conflicts with ${existing.leafFile} (string vs object)`,
      );
      return;
    }

    if (existing) {
      node = existing;
      continue;
    }

    const child = createNode(file);
    node.children.set(segment, child);
    node = child;
  }
}

function projectMessages(
  node: TreeNode,
  locale: string,
): Messages | undefined {
  let result: Messages | undefined;
  const children = [...node.children.entries()].sort(([a], [b]) =>
    compareStrings(a, b),
  );

  for (const [key, child] of children) {
    if (child.leafValues) {
      const text = child.leafValues[locale];
      if (typeof text !== "string") continue;
      result ??= {};
      result[key] = text;
      continue;
    }

    const nested = projectMessages(child, locale);
    if (!nested) continue;
    result ??= {};
    result[key] = nested;
  }

  return result;
}

function buildResources(
  trees: Map<string, NamespaceTree>,
  visibility: LocaleVisibility,
  namespaces: string[],
  locales: readonly string[],
): Record<string, Record<string, Messages>> {
  const resources: Record<string, Record<string, Messages>> = {};

  for (const locale of locales) {
    const byNamespace: Record<string, Messages> = {};
    for (const namespace of namespaces) {
      const tree = trees.get(`${visibility}:${namespace}`);
      if (!tree) continue;
      const messages = projectMessages(tree.root, locale);
      if (messages) byNamespace[namespace] = messages;
    }
    resources[locale] = byNamespace;
  }

  return resources;
}

const GENERATED_HEADER =
  "// AUTO-GENERATED by @repo/i18n codegen. Do not edit.";

function arrayLiteral(values: readonly string[]): string {
  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

function manifestSource(
  publicNamespaces: string[],
  privateNamespaces: string[],
): string {
  return `${GENERATED_HEADER}

export const PUBLIC_NAMESPACES = ${arrayLiteral(publicNamespaces)} as const;
export const PRIVATE_NAMESPACES = ${arrayLiteral(privateNamespaces)} as const;

export type PublicNamespace = (typeof PUBLIC_NAMESPACES)[number];
export type PrivateNamespace = (typeof PRIVATE_NAMESPACES)[number];
`;
}

function resourcesSource(
  exportName: string,
  namespacesExport: string,
  resources: Record<string, Record<string, Messages>>,
): string {
  return `${GENERATED_HEADER}

import type { LocaleResources } from "../../src/types";
import { ${namespacesExport} } from "../manifest";

export { ${namespacesExport} };

export const ${exportName}: LocaleResources = ${JSON.stringify(resources, null, 2)};
`;
}

let tempFileCounter = 0;

function writeIfChanged(file: string, content: string): boolean {
  try {
    if (fs.readFileSync(file, "utf8") === content) return false;
  } catch {
    // missing file — write below
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tempFile = `${file}.${process.pid}.${tempFileCounter}.tmp`;
  tempFileCounter += 1;

  try {
    fs.writeFileSync(tempFile, content, "utf8");
    fs.renameSync(tempFile, file);
  } catch (error) {
    fs.rmSync(tempFile, { force: true });
    throw error;
  }

  return true;
}

/**
 * Compile `locales/{public,private}` into TypeScript modules.
 *
 * Synchronous so Next config can call it during `next dev` / `next build`.
 * Validation runs first; nothing is written unless every file is valid.
 */
export function compileLocales(
  options: Partial<CompileOptions> = {},
): CompileResult {
  const { localesDir, outDir } = {
    ...DEFAULT_COMPILE_OPTIONS,
    ...options,
  };

  const { locales, defaultLocale } = readConfig();
  const errors: string[] = [];
  const { files, namespaces } = collectLocaleFiles(localesDir, errors);

  for (const namespace of namespaces.public) {
    if (namespaces.private.has(namespace)) {
      errors.push(
        `namespace "${namespace}" exists in both locales/public and locales/private`,
      );
    }
  }

  const trees = new Map<string, NamespaceTree>();

  for (const file of files) {
    const treeKey = `${file.visibility}:${file.namespace}`;
    let tree = trees.get(treeKey);
    if (!tree) {
      tree = {
        visibility: file.visibility,
        namespace: file.namespace,
        root: createNode(file.relativePath),
        leafCount: 0,
      };
      trees.set(treeKey, tree);
    }

    let parsed: unknown;
    try {
      parsed = parseYaml(
        fs.readFileSync(path.join(localesDir, file.relativePath), "utf8"),
      );
    } catch (error) {
      errors.push(`${file.relativePath}: ${errorMessage(error)}`);
      continue;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      errors.push(`${file.relativePath}: file content must be an object`);
      continue;
    }

    const basePath = file.containerPath.slice(1);

    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!isValidSegment(key)) {
        errors.push(`${file.relativePath}: invalid key "${key}"`);
        continue;
      }

      const values = validateLocaleMap(value, locales, defaultLocale);
      if (Array.isArray(values)) {
        const fullKey = [file.namespace, ...basePath, key].join(".");
        for (const error of values) {
          errors.push(`${file.relativePath}: key "${fullKey}" ${error}`);
        }
        continue;
      }

      insertLeaf(tree, [...basePath, key], values, file.relativePath, errors);
    }
  }

  const publicNamespaces = [...namespaces.public].sort(compareStrings);
  const privateNamespaces = [...namespaces.private].sort(compareStrings);

  for (const [visibility, list] of [
    ["public", publicNamespaces],
    ["private", privateNamespaces],
  ] as const) {
    for (const namespace of list) {
      if ((trees.get(`${visibility}:${namespace}`)?.leafCount ?? 0) === 0) {
        errors.push(`namespace "${namespace}" (${visibility}) has no leaves`);
      }
    }
  }

  if (errors.length > 0) {
    throw new LocaleCompileError(errors);
  }

  const publicResources = buildResources(
    trees,
    "public",
    publicNamespaces,
    locales,
  );
  const privateResources = buildResources(
    trees,
    "private",
    privateNamespaces,
    locales,
  );

  writeIfChanged(
    path.join(outDir, "manifest.ts"),
    manifestSource(publicNamespaces, privateNamespaces),
  );
  writeIfChanged(
    path.join(outDir, "public", "index.ts"),
    resourcesSource(
      "PUBLIC_RESOURCES",
      "PUBLIC_NAMESPACES",
      publicResources,
    ),
  );
  writeIfChanged(
    path.join(outDir, "private", "index.ts"),
    resourcesSource(
      "PRIVATE_RESOURCES",
      "PRIVATE_NAMESPACES",
      privateResources,
    ),
  );

  return {
    publicNamespaces,
    privateNamespaces,
    filesScanned: files.length,
  };
}
