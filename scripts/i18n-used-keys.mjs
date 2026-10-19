import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const todo = JSON.parse(readFileSync("scripts/.i18n-todo.json", "utf8").replace(/^\uFEFF/, ""));
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (/[\\/]i18n[\\/]/.test(p)) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}
const files = walk("src");
const customer = files.filter((f) => !/[\\/]admin/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");
const all = files.map((f) => readFileSync(f, "utf8")).join("\n");
const used = {};
let adminOnly = 0;
let dynamic = 0;
for (const [k, v] of Object.entries(todo.dict)) {
  if (customer.includes(`"${k}"`) || customer.includes(`'${k}'`)) used[k] = v;
  else if (all.includes(`"${k}"`)) adminOnly++;
  else {
    // keys built dynamically, e.g. `home.factoryTour.${zone}.name`
    const prefix = k.split(".").slice(0, 2).join(".");
    if (customer.includes("`" + prefix + ".")) { used[k] = v; dynamic++; }
  }
}
writeFileSync("scripts/.dict-used.txt", Object.entries(used).map(([k, v]) => `${k}\t${v}`).join("\n"));
console.log("used", Object.keys(used).length, "dynamic", dynamic, "adminOnly", adminOnly, "unused", Object.keys(todo.dict).length - Object.keys(used).length - adminOnly);
