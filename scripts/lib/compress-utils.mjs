import fs from "node:fs";
import path from "node:path";

export const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".heic",
  ".heif",
]);

export const VIDEO_EXT = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
  ".mkv",
  ".avi",
  ".wmv",
]);

export const AUDIO_EXT = new Set([
  ".mp3",
  ".m4a",
  ".aac",
  ".wav",
  ".flac",
  ".ogg",
  ".opus",
  ".wma",
]);

export const PDF_EXT = new Set([".pdf"]);

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function detectMediaKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (AUDIO_EXT.has(ext)) return "audio";
  if (PDF_EXT.has(ext)) return "pdf";
  return "unknown";
}

export function defaultOutputPath(inputPath, suffix, newExt) {
  const parsed = path.parse(inputPath);
  const ext = newExt ?? parsed.ext;
  return path.join(parsed.dir, `${parsed.name}.${suffix}${ext}`);
}

export function parseCliArgs(argv) {
  const positional = [];
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }
    positional.push(arg);
  }

  return { positional, flags };
}

export function collectInputFiles(target, recursive = false) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) {
    throw new Error(`Not found: ${abs}`);
  }

  const stat = fs.statSync(abs);
  if (stat.isFile()) return [abs];

  if (!stat.isDirectory()) {
    throw new Error(`Not a file or directory: ${abs}`);
  }

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (recursive) walk(full);
        continue;
      }
      if (entry.isFile()) files.push(full);
    }
  };
  walk(abs);
  return files;
}

export function printResult({ input, output, inputSize, outputSize }) {
  const saved =
    inputSize > 0
      ? `${(((inputSize - outputSize) / inputSize) * 100).toFixed(1)}% smaller`
      : "n/a";
  console.log(`  in :  ${input} (${formatBytes(inputSize)})`);
  console.log(`  out:  ${output} (${formatBytes(outputSize)})`);
  console.log(`  save: ${saved}`);
}
