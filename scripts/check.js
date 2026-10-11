// Static guardrails for src/: forbidden APIs, layering, imports and CSP. No dependencies.
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(repoRoot, "src");
const jsRoot = join(srcRoot, "js");

const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'";

// Folder -> top-level folders it may import from (src/js relative).
const ALLOWED_IMPORTS = {
  domain: ["domain", "utils"],
  storage: ["domain", "utils", "storage"],
  utils: ["utils"],
  ui: ["ui", "domain", "storage", "utils"],
};

const RELATIVE_IMPORT = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']*)["']/g;

const JS = [".js"];
const MARKUP = [".html"];
const TEXT = [".js", ".html", ".css"];

// exts: file types checked. appliesTo / except: optional filters on the path relative to src/.
const rules = [
  { exts: JS, pattern: /\beval\s*\(/g, message: "eval is not allowed" },
  { exts: JS, pattern: /\bnew\s+Function\b/g, message: "new Function is not allowed" },
  { exts: JS, pattern: /\bdocument\.write(ln)?\b/g, message: "document.write is not allowed" },
  { exts: JS, pattern: /\bset(Timeout|Interval)\s*\(\s*["'`]/g, message: "string timer callbacks are not allowed" },
  { exts: JS, pattern: /\.on[a-z]+\s*=(?!=)/gi, message: "use addEventListener, not on* properties" },
  { exts: JS, pattern: /\.(innerHTML|outerHTML)\b|\binsertAdjacentHTML\b/g, message: "use el() and textContent, not HTML strings" },
  { exts: JS, pattern: /\bfetch\s*\(/g, message: "no network calls; data stays in localStorage" },
  { exts: JS, pattern: /\bconsole\.\w+\s*\(/g, message: "no console output in src" },
  { exts: JS, pattern: /\btoFixed\s*\(/g, message: "format money with utils/money.js" },
  {
    exts: JS,
    pattern: /\blocalStorage\b/g,
    message: "localStorage is touched only by the composition root and storage/index.js",
    except: (rel) => rel === "js/main.js" || rel === "js/storage/index.js",
  },
  {
    exts: JS,
    appliesTo: (rel) => rel.startsWith("js/domain/"),
    pattern: /\b(document|window|sessionStorage)\b/g,
    message: "domain has no DOM or browser storage",
  },
  {
    exts: JS,
    appliesTo: (rel) => rel.startsWith("js/storage/"),
    pattern: /\b(document|window)\b/g,
    message: "storage has no DOM",
  },
  {
    exts: JS,
    pattern: /(?:from|import)\s*\(?\s*["']([^./"'][^"']*)["']/g,
    message: "no bare imports; the app has no runtime dependencies",
  },
  { exts: TEXT, pattern: /https?:\/\//g, message: "no external URLs; no CDN loading" },
  { exts: MARKUP, pattern: /<script(?![^>]*\ssrc\s*=)[^>]*>/gi, message: "no inline script" },
  { exts: MARKUP, pattern: /<style\b/gi, message: "no style element" },
  { exts: MARKUP, pattern: /\sstyle\s*=/gi, message: "no style attribute" },
  { exts: MARKUP, pattern: /\son[a-z]+\s*=/gi, message: "no inline event handler attributes" },
  { exts: MARKUP, pattern: /user-scalable\s*=\s*no|maximum-scale\s*=/gi, message: "zoom must not be disabled" },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if ([".js", ".html", ".css"].includes(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const toSrcRelative = (file) => relative(srcRoot, file).split(sep).join("/");
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

function scanRules(file, text, relPath, violations) {
  for (const rule of rules) {
    if (!rule.exts.includes(extname(file))) continue;
    if (rule.appliesTo && !rule.appliesTo(relPath)) continue;
    if (rule.except?.(relPath)) continue;
    for (const match of text.matchAll(rule.pattern)) {
      violations.push(`src/${relPath}:${lineOf(text, match.index)} ${rule.message} (${match[0].trim()})`);
    }
  }
}

function checkImports(file, text, relPath, violations) {
  if (extname(file) !== ".js" || !relPath.startsWith("js/")) return;
  const folder = relPath.split("/")[1];
  const allowed = ALLOWED_IMPORTS[folder];
  for (const match of text.matchAll(RELATIVE_IMPORT)) {
    const target = relative(jsRoot, resolve(dirname(file), match[1]));
    const top = target.split(sep)[0];
    const where = `src/${relPath}:${lineOf(text, match.index)}`;
    if (top.startsWith("..")) {
      violations.push(`${where} imports outside src/js (${match[1]})`);
    } else if (allowed && !allowed.includes(top)) {
      violations.push(`${where} ${folder} may not import ${top} (${match[1]})`);
    }
  }
}

async function checkCsp(violations) {
  const html = await readFile(join(srcRoot, "index.html"), "utf8").catch(() => null);
  if (html === null) {
    violations.push("src/index.html is missing");
  } else if (!html.includes(CSP)) {
    violations.push("src/index.html: CSP meta must match the policy in ui.instructions.md");
  }
}

async function main() {
  const files = await walk(srcRoot);
  const violations = [];

  for (const file of files) {
    const text = await readFile(file, "utf8");
    const relPath = toSrcRelative(file);
    scanRules(file, text, relPath, violations);
    checkImports(file, text, relPath, violations);
  }
  await checkCsp(violations);

  if (violations.length > 0) {
    for (const violation of violations) console.error(violation);
    console.error(`check failed: ${violations.length} violation(s) in ${files.length} file(s)`);
    process.exitCode = 1;
    return;
  }
  console.log(`check passed: ${files.length} file(s) in src/`);
}

main();
