import { describe, expect, it, vi } from "vitest";

import {
  classifyExternalLink,
  extractExternalLinkReferences,
  probeExternalLink,
  summarizeExternalLinkResults,
} from "../../scripts/lib/external-link-audit.mjs";

describe("external link release audit", () => {
  it("extracts normalized URLs with source line references", () => {
    expect(
      extractExternalLinkReferences(
        [
          "source: https://example.com/proof.",
          '<SourceLink href="https://example.com/docs?q=1">Docs</SourceLink>',
        ].join("\n"),
        "content/example.mdx",
      ),
    ).toEqual([
      {
        file: "content/example.mdx",
        line: 1,
        url: "https://example.com/proof",
      },
      {
        file: "content/example.mdx",
        line: 2,
        url: "https://example.com/docs?q=1",
      },
    ]);
  });

  it("keeps bot-protected X failures in explicit manual review", () => {
    expect(
      classifyExternalLink({
        status: 403,
        url: "https://x.com/Indo_Stellar/status/1",
      }),
    ).toMatchObject({ classification: "manual-review" });
    expect(
      classifyExternalLink({ status: 404, url: "https://example.com/missing" }),
    ).toEqual({
      classification: "failure",
      reason: "Unexpected HTTP status 404.",
    });
  });

  it("retries transient responses and accepts the recovered URL", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ body: { cancel }, status: 503, url: "" })
      .mockResolvedValueOnce({
        body: { cancel },
        status: 200,
        url: "https://example.com/final",
      });

    await expect(
      probeExternalLink("https://example.com/start", {
        fetchImpl,
        retryDelayMs: 0,
      }),
    ).resolves.toMatchObject({
      attempts: 2,
      classification: "reachable",
      finalUrl: "https://example.com/final",
      status: 200,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("summarizes release classifications deterministically", () => {
    expect(
      summarizeExternalLinkResults([
        { classification: "reachable" },
        { classification: "reachable" },
        { classification: "manual-review" },
        { classification: "failure" },
      ]),
    ).toEqual({
      counts: { failure: 1, "manual-review": 1, reachable: 2 },
      total: 4,
    });
  });
});
