// Collect every English string that has a Thai pair (Bi objects + t()/faq() helpers)
// in customer-facing code, plus dictionary keys missing in zh-hans.
// Usage: node scripts/i18n-extract.mjs > scripts/.i18n-todo.json
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const ROOT = "src";
const SKIP = [/[\\/]admin/, /[\\/]i18n[\\/]/, /routeTree\.gen/, /[\\/]integrations[\\/]/];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP.some((re) => re.test(p))) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const str = (n) =>
  n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null;

const found = new Map(); // en -> { th, files:Set }
function add(en, th, file) {
  if (!en || !/[A-Za-z]/.test(en)) return;
  const row = found.get(en) ?? { th, files: new Set() };
  row.files.add(file.replace(/\\/g, "/"));
  found.set(en, row);
}

for (const file of walk(ROOT)) {
  const src = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = {};
      for (const p of node.properties) {
        if (ts.isPropertyAssignment(p)) {
          const key = p.name.getText(src).replace(/["']/g, "");
          props[key] = str(p.initializer);
        }
      }
      if (props.th != null && props.en != null && props["zh-hans"] == null) add(props.en, props.th, file);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      const a = node.arguments.map(str);
      if (name === "t" && a.length >= 2 && a[0] != null && a[1] != null) {
        const extra = node.arguments[2];
        const hasZh = extra && ts.isObjectLiteralExpression(extra) && extra.getText(src).includes("zh-hans");
        if (!hasZh) add(a[1], a[0], file);
      }
      if (name === "faq" && a.length === 4) {
        add(a[1], a[0], file);
        add(a[3], a[2], file);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}

// Dictionary keys missing in zh-hans
const dictKeys = (f) => {
  const s = readFileSync(f, "utf8");
  const map = {};
  for (const m of s.matchAll(/^\s+"([\w.]+)":\s*\n?\s*("(?:[^"\\]|\\.)*")/gm)) map[m[1]] = JSON.parse(m[2]);
  return map;
};
const en = dictKeys("src/i18n/en.ts");
const zh = dictKeys("src/i18n/zh-hans.ts");
const missingDict = Object.fromEntries(Object.entries(en).filter(([k]) => !(k in zh)));

const content = [...found.entries()].map(([en, v]) => ({ en, th: v.th, files: [...v.files] }));
console.log(JSON.stringify({ contentCount: content.length, dictCount: Object.keys(missingDict).length, dict: missingDict, content }, null, 1));
