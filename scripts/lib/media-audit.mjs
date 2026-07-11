import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import sharp from "sharp";

const execFileAsync = promisify(execFile);

/**
 * @typedef {{ width: number, height: number, durationSeconds: number }} VideoProbeResult
 * @typedef {(file: string) => Promise<VideoProbeResult>} VideoProbe
 */

export const DEFAULT_MEDIA_BUDGETS = Object.freeze({
  image: 450 * 1024,
  mobileImage: 250 * 1024,
  socialImage: 180 * 1024,
  svg: 150 * 1024,
  video: 8 * 1024 * 1024,
  videoPoster: 250 * 1024,
  videoDurationSeconds: 30,
  document: 2 * 1024 * 1024,
});

const RASTER_FORMATS = new Set(["avif", "gif", "jpeg", "png", "webp"]);
const VISUAL_EXTENSION_FORMATS = new Map([
  [".avif", "avif"],
  [".gif", "gif"],
  [".jpeg", "jpeg"],
  [".jpg", "jpeg"],
  [".png", "png"],
  [".svg", "svg"],
  [".webp", "webp"],
]);
const VIDEO_EXTENSION_FORMATS = new Map([
  [".m4v", "mp4"],
  [".mov", "mov"],
  [".mp4", "mp4"],
  [".webm", "webm"],
]);
const MP4_BRANDS = new Set([
  "3g2a",
  "3gp4",
  "3gp5",
  "M4V ",
  "MSNV",
  "avc1",
  "dash",
  "iso2",
  "iso3",
  "iso4",
  "iso5",
  "iso6",
  "isom",
  "mp41",
  "mp42",
]);

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function detectSvg(bytes) {
  const prefix = bytes.subarray(0, 4096).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  return prefix.startsWith("<") && /<svg(?:\s|>)/i.test(prefix);
}

export function sniffFileFormat(bytes) {
  if (detectSvg(bytes)) return "svg";
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (bytes.length >= 6 && /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString("ascii"))) {
    return "gif";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "webm";
  }
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = bytes.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return "avif";
    if (brand === "qt  ") return "mov";
    if (MP4_BRANDS.has(brand)) return "mp4";
  }
  return "unknown";
}

export function scanSvg(svg, label = "SVG") {
  const failures = [];
  const checks = [
    [/<script\b/i, "contains a script element"],
    [/<foreignObject\b/i, "contains a foreignObject element"],
    [/<!DOCTYPE\b/i, "contains a document type declaration"],
    [/<!ENTITY\b/i, "contains an entity declaration"],
    [/\son[a-z][\w:.-]*\s*=/i, "contains an event-handler attribute"],
    [/javascript\s*:/i, "contains a javascript: URL"],
    [/\bdata\s*:/i, "contains a data: URL"],
    [/@import\b/i, "contains a CSS @import rule"],
  ];

  for (const [pattern, message] of checks) {
    if (pattern.test(svg)) failures.push(`${label}: SVG ${message}`);
  }

  for (const match of svg.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    const target = match[2]?.trim() ?? "";
    if (!target.startsWith("#")) {
      failures.push(`${label}: SVG contains a non-fragment CSS url()`);
      break;
    }
  }

  for (const match of svg.matchAll(/\b(?:xlink:href|href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const target = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!target.startsWith("#")) {
      failures.push(`${label}: SVG contains an external href/src reference`);
      break;
    }
  }

  if (/\b(?:xlink:href|href|src)\s*=\s*["']?\/\//i.test(svg)) {
    failures.push(`${label}: SVG contains a protocol-relative reference`);
  }

  return [...new Set(failures)];
}

async function readSafePublicMedia({ repositoryRoot, src, label }) {
  const failures = [];
  const mediaRoot = path.resolve(repositoryRoot, "public", "media");

  if (typeof src !== "string" || !src.startsWith("/media/")) {
    return {
      failures: [`${label}: path must be below /media/`],
      file: null,
    };
  }

  const encodedRelativeSource = src.slice("/media/".length);
  let relativeSource;
  try {
    relativeSource = decodeURIComponent(encodedRelativeSource);
  } catch {
    return {
      failures: [`${label}: path contains invalid percent encoding`],
      file: null,
    };
  }
  if (relativeSource.includes("\0") || relativeSource.includes("\\")) {
    return {
      failures: [`${label}: decoded path contains a forbidden character`],
      file: null,
    };
  }

  const candidate = path.resolve(mediaRoot, relativeSource);
  if (!isPathInside(mediaRoot, candidate)) {
    return {
      failures: [`${label}: resolved path escapes public/media`],
      file: null,
    };
  }

  try {
    const rootInfo = await lstat(mediaRoot);
    if (rootInfo.isSymbolicLink()) {
      return {
        failures: [`${label}: public/media must not be a symbolic link`],
        file: null,
      };
    }

    let cursor = mediaRoot;
    for (const segment of relativeSource.split("/")) {
      if (!segment) continue;
      cursor = path.join(cursor, segment);
      const cursorInfo = await lstat(cursor);
      if (cursorInfo.isSymbolicLink()) {
        failures.push(`${label}: symbolic links are not allowed below public/media`);
        return { failures, file: null };
      }
    }

    const [rootRealPath, candidateRealPath] = await Promise.all([
      realpath(mediaRoot),
      realpath(candidate),
    ]);
    if (!isPathInside(rootRealPath, candidateRealPath)) {
      failures.push(`${label}: real path escapes public/media`);
      return { failures, file: null };
    }

    const fileStat = await stat(candidateRealPath);
    if (!fileStat.isFile()) {
      failures.push(`${label}: media path is not a regular file`);
      return { failures, file: null };
    }

    const bytes = await readFile(candidateRealPath);
    return {
      failures,
      file: {
        bytes,
        path: candidateRealPath,
        size: fileStat.size,
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`${label}: could not safely read media (${detail})`);
    return { failures, file: null };
  }
}

function validateExtension({ src, actualFormat, extensionFormats, label }) {
  const extension = path.extname(src).toLowerCase();
  const expectedFormat = extensionFormats.get(extension);
  if (!expectedFormat) {
    return [`${label}: unsupported file extension ${extension || "(none)"}`];
  }
  if (expectedFormat !== actualFormat) {
    return [
      `${label}: ${extension} extension declares ${expectedFormat}, but file signature is ${actualFormat}`,
    ];
  }
  return [];
}

function fileSummary({ label, width, height, size, bytes, extra = "" }) {
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const dimensions = width && height ? `${width}x${height}, ` : "";
  const suffix = extra ? `, ${extra}` : "";
  return `${label}: ${dimensions}${formatBytes(size)}, sha256:${digest}${suffix}`;
}

export async function auditVisualFile({
  repositoryRoot,
  src,
  width,
  height,
  declaredKind,
  label,
  byteBudget,
}) {
  const safeRead = await readSafePublicMedia({ repositoryRoot, src, label });
  const failures = [...safeRead.failures];
  if (!safeRead.file) return { failures, warnings: [], summary: null };

  const { bytes, size } = safeRead.file;
  const actualFormat = sniffFileFormat(bytes);
  const expectedFormats = declaredKind === "svg" ? new Set(["svg"]) : RASTER_FORMATS;

  if (!expectedFormats.has(actualFormat)) {
    failures.push(`${label}: declared ${declaredKind}, but file signature is ${actualFormat}`);
  }
  failures.push(
    ...validateExtension({
      src,
      actualFormat,
      extensionFormats: VISUAL_EXTENSION_FORMATS,
      label,
    }),
  );

  if (size > byteBudget) {
    failures.push(`${label}: ${formatBytes(size)} exceeds ${formatBytes(byteBudget)} budget`);
  }

  if (actualFormat === "svg") {
    failures.push(...scanSvg(bytes.toString("utf8"), label));
  }

  let metadata = null;
  if (expectedFormats.has(actualFormat)) {
    try {
      metadata = await sharp(bytes, { failOn: "warning" }).metadata();
      if (metadata.width !== width || metadata.height !== height) {
        failures.push(
          `${label}: declared ${width}x${height}, file is ${metadata.width ?? "?"}x${metadata.height ?? "?"}`,
        );
      }
      if (
        declaredKind === "image" &&
        (metadata.exif || metadata.xmp || metadata.iptc || metadata.icc || metadata.hasProfile)
      ) {
        failures.push(`${label}: raster file retains EXIF, XMP, IPTC, or ICC metadata`);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(`${label}: Sharp could not inspect the declared visual (${detail})`);
    }
  }

  return {
    failures: [...new Set(failures)],
    warnings: [],
    summary: fileSummary({
      label,
      width: metadata?.width,
      height: metadata?.height,
      size,
      bytes,
      extra: actualFormat,
    }),
  };
}

export async function detectFfprobe(executable = process.env.FFPROBE_PATH || "ffprobe") {
  try {
    await execFileAsync(executable, ["-version"], { timeout: 5_000 });
    return executable;
  } catch {
    return null;
  }
}

export async function probeVideoWithFfprobe(file, executable = "ffprobe") {
  const { stdout } = await execFileAsync(
    executable,
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration:format=duration",
      "-of",
      "json",
      file,
    ],
    { maxBuffer: 1024 * 1024, timeout: 15_000 },
  );
  const payload = JSON.parse(stdout);
  const stream = payload.streams?.[0];
  const duration = Number(stream?.duration ?? payload.format?.duration);
  const width = Number(stream?.width);
  const height = Number(stream?.height);

  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(duration)) {
    throw new Error("ffprobe did not return finite width, height, and duration values");
  }

  return { width, height, durationSeconds: duration };
}

/**
 * @param {{
 *   repositoryRoot: string,
 *   src: string,
 *   width: number,
 *   height: number,
 *   durationSeconds: number,
 *   label: string,
 *   byteBudget: number,
 *   durationBudgetSeconds: number,
 *   probeVideo?: VideoProbe | null,
 *   requireFfprobe?: boolean,
 * }} options
 */
export async function auditVideoFile({
  repositoryRoot,
  src,
  width,
  height,
  durationSeconds,
  label,
  byteBudget,
  durationBudgetSeconds,
  probeVideo = null,
  requireFfprobe = false,
}) {
  const safeRead = await readSafePublicMedia({ repositoryRoot, src, label });
  const failures = [...safeRead.failures];
  const warnings = [];
  if (!safeRead.file) return { failures, warnings, summary: null };

  const { bytes, path: file, size } = safeRead.file;
  const actualFormat = sniffFileFormat(bytes);
  if (!new Set(["mov", "mp4", "webm"]).has(actualFormat)) {
    failures.push(`${label}: declared video, but file signature is ${actualFormat}`);
  }
  failures.push(
    ...validateExtension({
      src,
      actualFormat,
      extensionFormats: VIDEO_EXTENSION_FORMATS,
      label,
    }),
  );

  if (size > byteBudget) {
    failures.push(`${label}: ${formatBytes(size)} exceeds ${formatBytes(byteBudget)} budget`);
  }
  if (durationSeconds > durationBudgetSeconds) {
    failures.push(
      `${label}: declared ${durationSeconds}s exceeds ${durationBudgetSeconds}s duration budget`,
    );
  }

  let probe = null;
  if (!probeVideo) {
    const message = `${label}: ffprobe unavailable; video dimensions and duration were not verified`;
    if (requireFfprobe) failures.push(message);
    else warnings.push(`${message} (install FFmpeg or set MEDIA_AUDIT_REQUIRE_FFPROBE=1 to enforce)`);
  } else if (new Set(["mov", "mp4", "webm"]).has(actualFormat)) {
    try {
      probe = await probeVideo(file);
      if (probe.width !== width || probe.height !== height) {
        failures.push(
          `${label}: declared ${width}x${height}, video is ${probe.width}x${probe.height}`,
        );
      }
      if (Math.abs(probe.durationSeconds - durationSeconds) > 0.5) {
        failures.push(
          `${label}: declared ${durationSeconds}s, video is ${probe.durationSeconds.toFixed(2)}s`,
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(`${label}: ffprobe could not inspect video (${detail})`);
    }
  }

  return {
    failures: [...new Set(failures)],
    warnings: [...new Set(warnings)],
    summary: fileSummary({
      label,
      width: probe?.width,
      height: probe?.height,
      size,
      bytes,
      extra: probe ? `${actualFormat}, ${probe.durationSeconds.toFixed(2)}s` : actualFormat,
    }),
  };
}

function countPlainPdfPages(bytes) {
  const source = bytes.toString("latin1");
  return [...source.matchAll(/\/Type\s*\/Page\b/g)].length;
}

export async function auditDocumentFile({
  repositoryRoot,
  src,
  pageCount,
  label,
  byteBudget,
}) {
  const safeRead = await readSafePublicMedia({ repositoryRoot, src, label });
  const failures = [...safeRead.failures];
  const warnings = [];
  if (!safeRead.file) return { failures, warnings, summary: null };

  const { bytes, size } = safeRead.file;
  const actualFormat = sniffFileFormat(bytes);
  const extension = path.extname(src).toLowerCase();
  if (actualFormat !== "pdf") {
    failures.push(`${label}: declared document, but file signature is ${actualFormat}`);
  }
  if (extension !== ".pdf") {
    failures.push(`${label}: document must use a .pdf extension`);
  }
  if (size > byteBudget) {
    failures.push(`${label}: ${formatBytes(size)} exceeds ${formatBytes(byteBudget)} budget`);
  }

  const header = bytes.subarray(0, 8).toString("ascii");
  if (!/^%PDF-\d\.\d/.test(header)) {
    failures.push(`${label}: PDF header is missing or invalid`);
  }
  const tail = bytes.subarray(Math.max(0, bytes.length - 1024)).toString("latin1");
  if (!/%%EOF\s*$/.test(tail)) {
    failures.push(`${label}: PDF end-of-file marker is missing or invalid`);
  }

  const detectedPageCount = actualFormat === "pdf" ? countPlainPdfPages(bytes) : 0;
  if (pageCount && detectedPageCount > 0 && detectedPageCount !== pageCount) {
    failures.push(
      `${label}: declared ${pageCount} pages, plain PDF objects contain ${detectedPageCount}`,
    );
  } else if (pageCount && detectedPageCount === 0 && actualFormat === "pdf") {
    warnings.push(
      `${label}: page count could not be verified from plain PDF objects (likely compressed)`,
    );
  }

  return {
    failures: [...new Set(failures)],
    warnings: [...new Set(warnings)],
    summary: fileSummary({
      label,
      size,
      bytes,
      extra: detectedPageCount > 0 ? `pdf, ${detectedPageCount} page(s)` : "pdf",
    }),
  };
}

/**
 * @param {{
 *   repositoryRoot: string,
 *   asset: any,
 *   owner: string,
 *   isSocialImage?: boolean,
 *   budgets?: typeof DEFAULT_MEDIA_BUDGETS,
 *   probeVideo?: VideoProbe | null,
 *   requireFfprobe?: boolean,
 * }} options
 */
export async function auditReadyAssetFiles({
  repositoryRoot,
  asset,
  owner,
  isSocialImage = false,
  budgets = DEFAULT_MEDIA_BUDGETS,
  probeVideo = null,
  requireFfprobe = false,
}) {
  const results = [];
  const label = `${owner}/${asset.id}`;

  if (asset.mediaKind === "image" || asset.mediaKind === "svg") {
    results.push(
      await auditVisualFile({
        repositoryRoot,
        src: asset.src,
        width: asset.width,
        height: asset.height,
        declaredKind: asset.mediaKind,
        label,
        byteBudget:
          asset.mediaKind === "svg"
            ? budgets.svg
            : isSocialImage
              ? budgets.socialImage
              : budgets.image,
      }),
    );
    if (asset.mobile) {
      results.push(
        await auditVisualFile({
          repositoryRoot,
          src: asset.mobile.src,
          width: asset.mobile.width,
          height: asset.mobile.height,
          declaredKind: asset.mediaKind,
          label: `${label}:mobile`,
          byteBudget: asset.mediaKind === "svg" ? budgets.svg : budgets.mobileImage,
        }),
      );
    }
  } else if (asset.mediaKind === "video") {
    results.push(
      await auditVideoFile({
        repositoryRoot,
        src: asset.src,
        width: asset.width,
        height: asset.height,
        durationSeconds: asset.durationSeconds,
        label,
        byteBudget: budgets.video,
        durationBudgetSeconds: budgets.videoDurationSeconds,
        probeVideo,
        requireFfprobe,
      }),
    );
    results.push(
      await auditVisualFile({
        repositoryRoot,
        src: asset.poster,
        width: asset.width,
        height: asset.height,
        declaredKind: "image",
        label: `${label}:poster`,
        byteBudget: budgets.videoPoster,
      }),
    );
    if (asset.mobile) {
      results.push(
        await auditVideoFile({
          repositoryRoot,
          src: asset.mobile.src,
          width: asset.mobile.width,
          height: asset.mobile.height,
          durationSeconds: asset.durationSeconds,
          label: `${label}:mobile`,
          byteBudget: budgets.video,
          durationBudgetSeconds: budgets.videoDurationSeconds,
          probeVideo,
          requireFfprobe,
        }),
      );
    }
  } else if (asset.mediaKind === "document") {
    results.push(
      await auditDocumentFile({
        repositoryRoot,
        src: asset.src,
        pageCount: asset.pageCount,
        label,
        byteBudget: budgets.document,
      }),
    );
  } else {
    results.push({
      failures: [`${label}: unsupported ready media kind ${String(asset.mediaKind)}`],
      warnings: [],
      summary: null,
    });
  }

  return {
    failures: results.flatMap((result) => result.failures),
    warnings: results.flatMap((result) => result.warnings),
    summaries: results.flatMap((result) => (result.summary ? [result.summary] : [])),
  };
}
