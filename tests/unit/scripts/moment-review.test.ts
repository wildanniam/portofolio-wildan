import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { boundedWebp } from "../../../scripts/prepare-moment-review.mjs";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const reviewScript = fileURLToPath(
  new URL("../../../scripts/prepare-moment-review.mjs", import.meta.url),
);

describe("private moment review pipeline", () => {
  it("refuses to delete or write outside the ignored review directory", () => {
    const result = spawnSync(process.execPath, [reviewScript], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        MOMENT_REVIEW_OUTPUT: "../../public",
      },
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "MOMENT_REVIEW_OUTPUT must stay inside .quality-reports/moments-review.",
    );
  });

  it("fails closed when the minimum-quality derivative still exceeds its byte budget", async () => {
    const temporaryRoot = await mkdtemp(join(tmpdir(), "moment-budget-test-"));
    const source = await sharp(randomBytes(120 * 120 * 3), {
      raw: { width: 120, height: 120, channels: 3 },
    })
      .png()
      .toBuffer();

    try {
      await expect(
        boundedWebp(source, join(temporaryRoot, "bounded.webp"), 120, 64),
      ).rejects.toThrow("exceeds the 64-byte budget");
    } finally {
      await rm(temporaryRoot, { force: true, recursive: true });
    }
  });
});
