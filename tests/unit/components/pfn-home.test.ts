import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PersonalFieldNotesHome } from "../../../src/components/pfn/pfn-home";
import { selectHomepage } from "../../../src/content/queries";
import { loadContentBundle } from "../../../src/content/repository.node";
import { REPOSITORY_ROOT } from "../content/fixtures";

describe("Portfolio V3 homepage", () => {
  it("keeps all four flagship projects as ordinary links inside distinct editorial variants", () => {
    const selection = selectHomepage(loadContentBundle({ repositoryRoot: REPOSITORY_ROOT }), { asOf: "2026-07-12" });
    const markup = renderToStaticMarkup(
      createElement(PersonalFieldNotesHome, { selection }),
    );

    expect(markup).toContain('data-portfolio-v3="true"');
    expect((markup.match(/class="pfn-atlas-item pfn-atlas-item--/g) ?? []).length).toBe(4);
    expect(markup).toContain("pfn-atlas-item--feature");
    expect(markup).toContain("pfn-atlas-item--column");
    expect(markup).toContain("pfn-atlas-item--compact");
    expect(markup).toContain("pfn-atlas-item--landscape");
    expect(markup).toContain('href="/work/fradium"');
    expect(markup).toContain('href="/work/nova-ai"');
    expect(markup).toContain('href="/work/paygate"');
    expect(markup).toContain('href="/work/quorum"');
    expect(markup).not.toContain("opg-project-explorer");
    expect(markup).not.toContain("Preview evidence");
    expect(markup).not.toContain("pfn-project-item");
  });

  it("shows the published documentary sequence without generated placeholder media", () => {
    const selection = selectHomepage(loadContentBundle({ repositoryRoot: REPOSITORY_ROOT }), { asOf: "2026-07-12" });
    const markup = renderToStaticMarkup(
      createElement(PersonalFieldNotesHome, { selection }),
    );

    expect(markup).toContain("refactory-build-room");
    expect(markup).toContain("fradium-wchl-team");
    expect(markup).toContain("learning-in-public");
    expect(markup).not.toContain("Coming soon");
    expect(markup).not.toContain("placeholder");
  });
});
