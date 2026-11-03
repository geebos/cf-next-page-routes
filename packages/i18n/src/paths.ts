const SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

export type LocaleVisibility = "public" | "private";

export type ParsedLocaleFile = {
  visibility: LocaleVisibility;
  namespace: string;
  /** Path segments of the container inside the namespace, starting with the namespace. */
  containerPath: string[];
};

export function isValidSegment(value: string): boolean {
  // `__proto__` would mutate object prototypes instead of adding a key.
  return SEGMENT_PATTERN.test(value) && value !== "__proto__";
}

export const LOCALE_FILE_EXTENSION = ".yml";

/**
 * Parse a locale source file path relative to the locales root.
 *
 * `<visibility>/<namespace>/<dir...>/<file>.yml`
 * - `public/home/_home.yml` -> container `["home"]`
 * - `public/home/hero.yml`  -> container `["home", "hero"]`
 * - `public/home/account/profile.yml` -> container `["home", "account", "profile"]`
 */
export function parseLocaleFilePath(relativePath: string): ParsedLocaleFile {
  const segments = relativePath.split(/[\\/]+/).filter(Boolean);
  if (segments.length === 0) {
    throw new Error("empty path");
  }

  const [visibility, namespace, ...rest] = segments;
  if (visibility !== "public" && visibility !== "private") {
    throw new Error(`unknown visibility directory "${visibility}"`);
  }
  if (!namespace || rest.length === 0) {
    throw new Error("locale file must live inside a namespace directory");
  }
  if (!isValidSegment(namespace) || namespace.startsWith("_")) {
    throw new Error(`invalid namespace "${namespace}"`);
  }

  const fileName = rest[rest.length - 1]!;
  const dirs = rest.slice(0, -1);
  for (const dir of dirs) {
    if (!isValidSegment(dir) || dir.startsWith("_")) {
      throw new Error(`invalid directory "${dir}"`);
    }
  }

  if (!fileName.endsWith(LOCALE_FILE_EXTENSION)) {
    throw new Error(`file must have ${LOCALE_FILE_EXTENSION} extension`);
  }
  const stem = fileName.slice(0, -LOCALE_FILE_EXTENSION.length);
  if (!stem) {
    throw new Error("empty file name");
  }

  if (stem.startsWith("_")) {
    if (dirs.length > 0) {
      throw new Error(`"${fileName}" must be at the namespace root`);
    }
    if (stem !== `_${namespace}`) {
      throw new Error(
        `"${fileName}" must be named "_${namespace}${LOCALE_FILE_EXTENSION}"`,
      );
    }
    return { visibility, namespace, containerPath: [namespace] };
  }

  if (!isValidSegment(stem)) {
    throw new Error(`invalid file name "${stem}"`);
  }

  return { visibility, namespace, containerPath: [namespace, ...dirs, stem] };
}
