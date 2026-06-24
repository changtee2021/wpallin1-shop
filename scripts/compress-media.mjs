#!/usr/bin/env node
/**
 * Compress images, video, audio, and PDF before web upload.
 *
 * Usage:
 *   node scripts/compress-media.mjs <file-or-folder> [options]
 *
 * Options:
 *   --out <path>        Output file (single input only)
 *   --type <kind>       image | video | audio | pdf | auto (default)
 *   --recursive         When input is a folder, process all files inside
 *   --format <fmt>      image: jpeg|webp|png — audio: mp3|aac|opus
 *   --quality <n>       image JPEG/WebP quality (default 82)
 *   --max <px>          image max dimension (default 1920)
 *   --crf <n>           video H.264 CRF (default 28, lower = better)
 *   --max-height <px>   video max height (default 1080)
 *   --bitrate <rate>    audio bitrate (default 128k)
 *   --preset <name>     pdf: screen | ebook | printer (default ebook)
 */
import {
  collectInputFiles,
  detectMediaKind,
  parseCliArgs,
  printResult,
} from "./lib/compress-utils.mjs";
import { compressImage, logImageStart } from "./lib/compress-image.mjs";
import { compressPdf, logPdfStart } from "./lib/compress-pdf.mjs";
import {
  compressAudio,
  compressVideo,
  logAvStart,
} from "./lib/compress-ffmpeg.mjs";

const HELP = `
wpallin1-shop media compressor — บีบอัดไฟล์ก่อนอัปลงเว็บ

Usage:
  npm run media:compress -- "<input>" [options]
  npm run media:compress -- "./assets" --recursive

Options:
  --out <path>        Output path (single file only)
  --type <kind>       image | video | audio | pdf | auto
  --recursive         Process all files in a folder
  --format <fmt>      image: jpeg|webp|png — audio: mp3|aac|opus
  --quality <n>       Image quality 1-100 (default 82)
  --max <px>          Image max width/height (default 1920)
  --crf <n>           Video quality (default 28)
  --max-height <px>   Video max height (default 1080)
  --bitrate <rate>    Audio bitrate (default 128k)
  --preset <name>     PDF: screen | ebook | printer

Examples:
  npm run media:compress -- "catalog.pdf"
  npm run media:compress -- "hero.png" --format webp
  npm run media:compress -- "promo.mp4" --crf 30
  npm run media:compress -- "voice.wav" --format mp3

See docs/MEDIA-COMPRESS.md for recommended limits.
`.trim();

const { positional, flags } = parseCliArgs(process.argv.slice(2));

if (flags.help || positional.length === 0) {
  console.log(HELP);
  process.exit(flags.help ? 0 : 1);
}

const target = positional[0];
const recursive = Boolean(flags.recursive);
const forcedType = flags.type && flags.type !== "auto" ? flags.type : null;
const sharedOut = flags.out ?? null;

let files;
try {
  files = collectInputFiles(target, recursive);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

if (sharedOut && files.length > 1) {
  console.error("--out works only with a single input file.");
  process.exit(1);
}

const results = [];
let failures = 0;

for (const file of files) {
  const kind = forcedType ?? detectMediaKind(file);
  if (kind === "unknown") {
    console.warn(`skip (unknown type): ${file}`);
    continue;
  }

  try {
    let result;
    const output = sharedOut ?? undefined;

    if (kind === "image") {
      logImageStart(file);
      result = await compressImage(file, {
        output,
        quality: flags.quality,
        max: flags.max,
        format: flags.format,
      });
    } else if (kind === "pdf") {
      logPdfStart(file);
      result = await compressPdf(file, {
        output,
        preset: flags.preset,
      });
    } else if (kind === "video") {
      logAvStart("video", file);
      result = await compressVideo(file, {
        output,
        crf: flags.crf,
        maxHeight: flags["max-height"],
        preset: flags["x264-preset"],
      });
    } else if (kind === "audio") {
      logAvStart("audio", file);
      result = await compressAudio(file, {
        output,
        bitrate: flags.bitrate,
        format: flags.format,
      });
    }

    if (result) {
      results.push(result);
      printResult(result);
      if (result.skipped) console.log("  note: kept original (no size gain)");
      console.log("");
    }
  } catch (err) {
    failures += 1;
    console.error(`failed: ${file}`);
    console.error(`  ${err.message}`);
    console.log("");
  }
}

if (results.length === 0 && failures === 0) {
  console.error("No supported media files found.");
  process.exit(1);
}

const totalIn = results.reduce((sum, row) => sum + row.inputSize, 0);
const totalOut = results.reduce((sum, row) => sum + row.outputSize, 0);
if (results.length > 1) {
  const pct =
    totalIn > 0 ? (((totalIn - totalOut) / totalIn) * 100).toFixed(1) : "0";
  console.log(`Done: ${results.length} file(s), ${pct}% total savings`);
}

process.exit(failures > 0 ? 1 : 0);
