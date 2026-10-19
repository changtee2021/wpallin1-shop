// Collect every Thai→English pair shown on customer pages so my / lo / km can be
// translated from one list. Output: scripts/.sea/source.json
// Usage: node scripts/i18n-extract-sea.mjs
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const ROOT = "src";
const SKIP = [/[\\/]admin/, /[\\/]i18n[\\/]/, /routeTree\.gen/, /[\\/]integrations[\\/]/];
const THAI = /[\u0E00-\u0E7F]/;

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

const content = new Map();
function add(en, th, file) {
  if (!en || !th || !THAI.test(th) || !/[A-Za-z]/.test(en)) return;
  const row = content.get(en) ?? { th, files: new Set() };
  row.files.add(file.replace(/\\/g, "/"));
  content.set(en, row);
}

for (const file of walk(ROOT)) {
  const src = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = {};
      for (const p of node.properties) {
        if (ts.isPropertyAssignment(p)) {
          props[p.name.getText(src).replace(/["']/g, "")] = str(p.initializer);
        }
      }
      if (props.th != null && props.en != null) add(props.en, props.th, file);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      const a = node.arguments.map(str);
      if (name === "t" && a.length >= 2 && a[0] != null && a[1] != null) add(a[1], a[0], file);
      if (name === "faq" && a.length === 4) {
        add(a[1], a[0], file);
        add(a[3], a[2], file);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}

const dictKeys = (f) => {
  const s = readFileSync(f, "utf8");
  const map = {};
  for (const m of s.matchAll(/^\s+"([\w.]+)":\s*\n?\s*("(?:[^"\\]|\\.)*")/gm)) map[m[1]] = JSON.parse(m[2]);
  return map;
};
const th = dictKeys("src/i18n/th.ts");
const en = dictKeys("src/i18n/en.ts");
const dict = Object.entries(th)
  .filter(([, v]) => THAI.test(v))
  .map(([key, v]) => ({ key, th: v, en: en[key] ?? "" }));

mkdirSync("scripts/.sea", { recursive: true });
const rows = [...content.entries()].map(([en, v]) => ({ en, th: v.th }));
writeFileSync("scripts/.sea/source.json", JSON.stringify({ dict, content: rows }, null, 1), "utf8");
console.log("dict", dict.length, "content", rows.length);
