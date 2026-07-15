import { describe, expect, it } from "vitest";

import {
  BriefProjectEditorialSchema,
  FullProjectEditorialSchema,
} from "../../../src/content/schema";

describe("project editorial schemas", () => {
  it("requires bounded archive and metadata copy", () => {
    const result = BriefProjectEditorialSchema.safeParse({
      archive: { summary: "A".repeat(181) },
      metadata: { description: "A".repeat(181) },
    });

    expect(result.success).toBe(false);
  });

  it("requires full case-opening questions to end with a question mark", () => {
    const result = FullProjectEditorialSchema.safeParse({
      archive: { summary: "A bounded archive summary." },
      metadata: { description: "A bounded metadata description." },
      caseOpening: {
        question: "This is not a question",
        answer: "A bounded mechanism-focused answer.",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a case opening on a brief project contract", () => {
    const result = BriefProjectEditorialSchema.safeParse({
      archive: { summary: "A bounded archive summary." },
      metadata: { description: "A bounded metadata description." },
      caseOpening: {
        question: "Should this exist?",
        answer: "No.",
      },
    });

    expect(result.success).toBe(false);
  });
});
