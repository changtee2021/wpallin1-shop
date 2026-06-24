import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { defaultOutputPath, formatBytes } from "./compress-utils.mjs";

export async function compressImage(inputPath, options = {}) {
  const maxDimension = Number(options.max ?? 1920);
  const quality = Number(options.quality ?? 82);
  const format = (options.format ?? "jpeg").toLowerCase();
  const outputPath =
    options.output ??
    defaultOutputPath(
      inputPath,
      "web",
      format === "webp" ? ".webp" : format === "png" ? ".png" : ".jpg",
    );

  const inputSize = fs.statSync(inputPath).size;
  let pipeline = sharp(inputPath, { failOn: "none" }).rotate();

  pipeline = pipeline.resize({
    width: maxDimension,
    height: maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (format === "webp") {
    pipeline = pipeline.webp({ quality, effort: 4 });
  } else if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  await pipeline.toFile(outputPath);
  const outputSize = fs.statSync(outputPath).size;

  if (outputSize >= inputSize && options.skipIfLarger !== false) {
    if (outputPath !== inputPath) {
      await fs.promises.unlink(outputPath).catch(() => undefined);
    }
    return {
      input: inputPath,
      output: inputPath,
      inputSize,
      outputSize: inputSize,
      skipped: true,
      reason: "compressed not smaller",
    };
  }

  return {
    input: inputPath,
    output: outputPath,
    inputSize,
    outputSize,
    skipped: false,
  };
}

export function logImageStart(inputPath) {
  console.log(
    `[image] ${path.basename(inputPath)} (${formatBytes(fs.statSync(inputPath).size)})`,
  );
}
