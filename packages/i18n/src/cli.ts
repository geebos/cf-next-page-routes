import path from "node:path";

import {
  compileLocales,
  DEFAULT_COMPILE_OPTIONS,
  LocaleCompileError,
  type CompileResult,
} from "./compile";
import { watchLocales } from "./watch";

function printResult(namespaces: string[], label: string): void {
  console.log(`  ${label}: ${namespaces.join(", ") || "(none)"}`);
}

function report(result: CompileResult): void {
  console.log(`i18n: compiled ${result.filesScanned} file(s)`);
  printResult(result.publicNamespaces, "public");
  printResult(result.privateNamespaces, "private");
  console.log(
    `  output: ${path.relative(process.cwd(), DEFAULT_COMPILE_OPTIONS.outDir)}`,
  );
}

function reportError(error: Error): void {
  if (error instanceof LocaleCompileError) {
    console.error(error.message);
    return;
  }
  console.error(error);
}

if (process.argv.includes("--watch")) {
  watchLocales(
    {},
    {
      onCompile: report,
      onError: reportError,
    },
  );
  console.log("i18n: watching locales/");
} else {
  try {
    report(compileLocales());
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}
