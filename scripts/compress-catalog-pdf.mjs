#!/usr/bin/env node
/** Thin alias — use `npm run media:compress` for all media types. */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const main = path.join(__dirname, "compress-media.mjs");
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    'Usage: npm run catalog:compress -- "<input.pdf>" [output.pdf] [screen|ebook|printer]',
  );
  console.error(
    'Tip: npm run media:compress -- "<file>" --type pdf --preset ebook',
  );
  process.exit(1);
}

const input = args[0];
const resolution = args.find((a) => ["screen", "ebook", "printer"].includes(a));
const explicitOutput = args.find(
  (a, i) => i > 0 && !["screen", "ebook", "printer"].includes(a),
);

const forward = [input, "--type", "pdf"];
if (explicitOutput) forward.push("--out", explicitOutput);
if (resolution) forward.push("--preset", resolution);

const child = spawn(process.execPath, [main, ...forward], { stdio: "inherit" });
child.on("close", (code) => process.exit(code ?? 1));
