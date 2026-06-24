import fs from "node:fs";
import path from "node:path";
import { compress } from "compress-pdf";

import { defaultOutputPath, formatBytes } from "./compress-utils.mjs";

export async function compressPdf(inputPath, options = {}) {
  const resolution = options.preset ?? options.resolution ?? "ebook";
  const outputPath =
    options.output ??
    defaultOutputPath(inputPath, `compressed-${resolution}`, ".pdf");

  const inputSize = fs.statSync(inputPath).size;
  console.log(`[pdf] preset=${resolution}`);
  const buffer = await compress(inputPath, { resolution });
  await fs.promises.writeFile(outputPath, buffer);

  return {
    input: inputPath,
    output: outputPath,
    inputSize,
    outputSize: buffer.length,
    skipped: false,
  };
}

export function logPdfStart(inputPath) {
  console.log(
    `[pdf] ${path.basename(inputPath)} (${formatBytes(fs.statSync(inputPath).size)})`,
  );
}
