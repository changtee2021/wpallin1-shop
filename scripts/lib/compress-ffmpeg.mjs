import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { defaultOutputPath, formatBytes } from "./compress-utils.mjs";

export async function findFfmpeg() {
  const candidates = ["ffmpeg", "ffmpeg.exe"];
  for (const bin of candidates) {
    try {
      await runCommand(bin, ["-version"], { collect: true });
      return bin;
    } catch {
      // try next
    }
  }
  throw new Error(
    "ffmpeg not found — install from https://ffmpeg.org/download.html or: winget install Gyan.FFmpeg",
  );
}

function runCommand(cmd, args, { collect = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: collect ? "pipe" : "inherit" });
    let stdout = "";
    let stderr = "";
    if (collect) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(collect ? stdout || stderr : undefined);
      else reject(new Error(stderr || `${cmd} exited with code ${code}`));
    });
  });
}

export async function compressVideo(inputPath, options = {}) {
  const ffmpeg = await findFfmpeg();
  const crf = String(options.crf ?? 28);
  const maxHeight = String(options.maxHeight ?? 1080);
  const audioBitrate = options.audioBitrate ?? "128k";
  const outputPath =
    options.output ?? defaultOutputPath(inputPath, "web", ".mp4");

  const inputSize = fs.statSync(inputPath).size;
  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `scale=-2:'min(${maxHeight},ih)'`,
    "-c:v",
    "libx264",
    "-preset",
    options.preset ?? "medium",
    "-crf",
    crf,
    "-c:a",
    "aac",
    "-b:a",
    audioBitrate,
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await runCommand(ffmpeg, args);
  const outputSize = fs.statSync(outputPath).size;

  return {
    input: inputPath,
    output: outputPath,
    inputSize,
    outputSize,
    skipped: false,
  };
}

export async function compressAudio(inputPath, options = {}) {
  const ffmpeg = await findFfmpeg();
  const bitrate = options.bitrate ?? "128k";
  const format = (options.format ?? "mp3").toLowerCase();
  const ext = format === "aac" ? ".m4a" : format === "opus" ? ".opus" : ".mp3";
  const outputPath = options.output ?? defaultOutputPath(inputPath, "web", ext);

  const inputSize = fs.statSync(inputPath).size;
  const codec =
    format === "aac" ? "aac" : format === "opus" ? "libopus" : "libmp3lame";

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-c:a",
    codec,
    "-b:a",
    bitrate,
    outputPath,
  ];

  await runCommand(ffmpeg, args);
  const outputSize = fs.statSync(outputPath).size;

  return {
    input: inputPath,
    output: outputPath,
    inputSize,
    outputSize,
    skipped: false,
  };
}

export function logAvStart(kind, inputPath) {
  console.log(
    `[${kind}] ${path.basename(inputPath)} (${formatBytes(fs.statSync(inputPath).size)})`,
  );
}
