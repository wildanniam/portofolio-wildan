import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";

import {
  ATLAS_MEDIA_BUDGETS,
  auditDocumentFile,
  auditReadyAssetFiles,
  auditVideoFile,
  auditVisualFile,
  BRAND_MEDIA_BUDGET_BYTES,
  DOCUMENTARY_MEDIA_BUDGETS,
  scanSvg,
  sniffFileFormat,
} from "../../../scripts/lib/media-audit.mjs";

const temporaryRoots: string[] = [];

async function makeRepositoryRoot() {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "portfolio-media-audit-"));
  temporaryRoots.push(repositoryRoot);
  await mkdir(path.join(repositoryRoot, "public", "media", "tests"), { recursive: true });
  return repositoryRoot;
}

async function writeMedia(repositoryRoot: string, name: string, bytes: Buffer | string) {
  const file = path.join(repositoryRoot, "public", "media", "tests", name);
  await writeFile(file, bytes);
  return `/media/tests/${name}`;
}

async function makeWebp(width = 12, height = 8) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 30, g: 50, b: 80, alpha: 1 },
    },
  })
    .webp({ quality: 80 })
    .toBuffer();
}

function makeMp4Signature() {
  const bytes = Buffer.alloc(64);
  bytes.writeUInt32BE(24, 0);
  bytes.write("ftyp", 4, "ascii");
  bytes.write("isom", 8, "ascii");
  return bytes;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((repositoryRoot) =>
      rm(repositoryRoot, { force: true, recursive: true }),
    ),
  );
});

describe("public media format sniffing", () => {
  it("recognizes raster, SVG, PDF, and video signatures independently of extensions", async () => {
    expect(sniffFileFormat(await makeWebp())).toBe("webp");
    expect(sniffFileFormat(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe(
      "svg",
    );
    expect(sniffFileFormat(Buffer.from("%PDF-1.7\n%%EOF\n"))).toBe("pdf");
    expect(sniffFileFormat(makeMp4Signature())).toBe("mp4");
    expect(sniffFileFormat(Buffer.from("not media"))).toBe("unknown");
  });
});

describe("SVG security scan", () => {
  it("allows internal fragment paint servers and references", () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8">
        <defs><pattern id="grid" width="2" height="2" /></defs>
        <rect id="shape" width="12" height="8" fill="url(#grid)" />
        <use href="#shape" />
      </svg>
    `;

    expect(scanSvg(svg, "safe-svg")).toEqual([]);
  });

  it.each([
    ["script", '<svg><script>alert(1)</script></svg>'],
    ["foreignObject", '<svg><foreignObject><div /></foreignObject></svg>'],
    ["entity", '<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg />'],
    ["event handler", '<svg><rect onload="alert(1)" /></svg>'],
    ["javascript URL", '<svg><a href="javascript:alert(1)" /></svg>'],
    ["data URL", '<svg><image href="data:image/png;base64,AA==" /></svg>'],
    ["protocol-relative reference", '<svg><image href="//example.com/a.png" /></svg>'],
    ["external href", '<svg><image href="https://example.com/a.png" /></svg>'],
    ["CSS import", '<svg><style>@import "https://example.com/a.css";</style></svg>'],
    ["external CSS url", '<svg><rect fill="url(https://example.com/a.svg#x)" /></svg>'],
  ])("rejects %s", (_name, svg) => {
    expect(scanSvg(svg, "unsafe-svg").length).toBeGreaterThan(0);
  });
});

describe("visual media audit", () => {
  it("keeps Atlas fragments and identity assets inside the V4 budgets", () => {
    expect(ATLAS_MEDIA_BUDGETS.image).toBe(90 * 1024);
    expect(ATLAS_MEDIA_BUDGETS.mobileImage).toBe(60 * 1024);
    expect(ATLAS_MEDIA_BUDGETS.svg).toBe(24 * 1024);
    expect(BRAND_MEDIA_BUDGET_BYTES).toBe(12 * 1024);
  });

  it("keeps documentary desktop and mobile images inside the release budgets", () => {
    expect(DOCUMENTARY_MEDIA_BUDGETS.image).toBe(200 * 1024);
    expect(DOCUMENTARY_MEDIA_BUDGETS.mobileImage).toBe(140 * 1024);
  });

  it("checks real raster dimensions, extension, size, and metadata", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "image.webp", await makeWebp(12, 8));

    const result = await auditVisualFile({
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/image",
      byteBudget: 10_000,
    });

    expect(result.failures).toEqual([]);
    expect(result.summary).toContain("12x8");
    expect(result.summary).toContain("webp");
  });

  it("reports declared-dimension and byte-budget violations", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "oversized.webp", await makeWebp(12, 8));

    const result = await auditVisualFile({
      repositoryRoot,
      src,
      width: 24,
      height: 16,
      declaredKind: "image",
      label: "test/budgets",
      byteBudget: 1,
    });

    expect(result.failures.some((failure) => failure.includes("exceeds 0.0 KiB budget"))).toBe(
      true,
    );
    expect(result.failures).toContain("test/budgets: declared 24x16, file is 12x8");
  });

  it("rejects an SVG masquerading as a raster image before Sharp inspection", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(
      repositoryRoot,
      "masquerading.webp",
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" />',
    );

    const result = await auditVisualFile({
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/svg-as-raster",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain(
      "test/svg-as-raster: declared image, but file signature is svg",
    );
    expect(result.failures.some((failure) => failure.includes("extension declares webp"))).toBe(
      true,
    );
  });

  it("rejects a raster masquerading as an SVG", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "masquerading.svg", await makeWebp(12, 8));

    const result = await auditVisualFile({
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      declaredKind: "svg",
      label: "test/raster-as-svg",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain(
      "test/raster-as-svg: declared svg, but file signature is webp",
    );
    expect(result.failures.some((failure) => failure.includes("extension declares svg"))).toBe(
      true,
    );
  });

  it("rejects a raster whose extension disagrees with its signature", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const png = await sharp({
      create: {
        width: 12,
        height: 8,
        channels: 3,
        background: "#123456",
      },
    })
      .png()
      .toBuffer();
    const src = await writeMedia(repositoryRoot, "wrong.webp", png);

    const result = await auditVisualFile({
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/wrong-extension",
      byteBudget: 10_000,
    });

    expect(result.failures.some((failure) => failure.includes("file signature is png"))).toBe(
      true,
    );
  });

  it("rejects media symlinks, including links that escape public/media", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const outside = path.join(repositoryRoot, "outside.webp");
    await writeFile(outside, await makeWebp());
    await symlink(outside, path.join(repositoryRoot, "public", "media", "tests", "linked.webp"));

    const result = await auditVisualFile({
      repositoryRoot,
      src: "/media/tests/linked.webp",
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/symlink",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain(
      "test/symlink: symbolic links are not allowed below public/media",
    );
  });

  it("rejects lexical traversal before reading a file", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const result = await auditVisualFile({
      repositoryRoot,
      src: "/media/../outside.webp",
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/traversal",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain("test/traversal: resolved path escapes public/media");
  });

  it("rejects percent-encoded traversal after URL decoding", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const result = await auditVisualFile({
      repositoryRoot,
      src: "/media/%2e%2e/outside.webp",
      width: 12,
      height: 8,
      declaredKind: "image",
      label: "test/encoded-traversal",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain(
      "test/encoded-traversal: resolved path escapes public/media",
    );
  });
});

describe("video and poster audit", () => {
  it("validates video signature, ffprobe metadata, and its raster poster", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const videoSrc = await writeMedia(repositoryRoot, "demo.mp4", makeMp4Signature());
    const poster = await writeMedia(repositoryRoot, "demo-poster.webp", await makeWebp(12, 8));

    const result = await auditReadyAssetFiles({
      repositoryRoot,
      owner: "project:test",
      asset: {
        id: "demo",
        status: "ready",
        mediaKind: "video",
        src: videoSrc,
        width: 12,
        height: 8,
        durationSeconds: 8,
        poster,
      },
      probeVideo: async () => ({ width: 12, height: 8, durationSeconds: 8.1 }),
    });

    expect(result.failures).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.summaries).toHaveLength(2);
  });

  it("warns when ffprobe is unavailable, or fails when enforcement is requested", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "demo.mp4", makeMp4Signature());
    const input = {
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      durationSeconds: 8,
      label: "test/video",
      byteBudget: 10_000,
      durationBudgetSeconds: 30,
    };

    const advisory = await auditVideoFile(input);
    expect(advisory.failures).toEqual([]);
    expect(advisory.warnings[0]).toContain("ffprobe unavailable");

    const enforced = await auditVideoFile({ ...input, requireFfprobe: true });
    expect(enforced.failures[0]).toContain("ffprobe unavailable");
    expect(enforced.warnings).toEqual([]);
  });

  it("fails when probed dimensions or duration exceed the declared contract", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "demo.mp4", makeMp4Signature());
    const result = await auditVideoFile({
      repositoryRoot,
      src,
      width: 12,
      height: 8,
      durationSeconds: 8,
      label: "test/video-metadata",
      byteBudget: 10_000,
      durationBudgetSeconds: 7,
      probeVideo: async () => ({ width: 16, height: 9, durationSeconds: 10 }),
    });

    expect(result.failures.some((failure) => failure.includes("duration budget"))).toBe(true);
    expect(result.failures.some((failure) => failure.includes("video is 16x9"))).toBe(true);
    expect(result.failures.some((failure) => failure.includes("video is 10.00s"))).toBe(true);
  });
});

describe("document audit", () => {
  it("accepts a bounded PDF with a valid signature, EOF marker, and plain page object", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const pdf = "%PDF-1.7\n1 0 obj\n<< /Type /Page >>\nendobj\ntrailer\n<<>>\n%%EOF\n";
    const src = await writeMedia(repositoryRoot, "evidence.pdf", pdf);
    const result = await auditDocumentFile({
      repositoryRoot,
      src,
      pageCount: 1,
      label: "test/document",
      byteBudget: 10_000,
    });

    expect(result.failures).toEqual([]);
    expect(result.summary).toContain("1 page(s)");
  });

  it("rejects a non-PDF masquerading as a document", async () => {
    const repositoryRoot = await makeRepositoryRoot();
    const src = await writeMedia(repositoryRoot, "evidence.pdf", "<html>not a pdf</html>");
    const result = await auditDocumentFile({
      repositoryRoot,
      src,
      pageCount: 1,
      label: "test/bad-document",
      byteBudget: 10_000,
    });

    expect(result.failures).toContain(
      "test/bad-document: declared document, but file signature is unknown",
    );
    expect(result.failures).toContain("test/bad-document: PDF header is missing or invalid");
    expect(result.failures).toContain(
      "test/bad-document: PDF end-of-file marker is missing or invalid",
    );
  });
});
