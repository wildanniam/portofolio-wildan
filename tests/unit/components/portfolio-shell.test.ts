import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PortfolioShell } from "../../../src/components/portfolio/shell/portfolio-shell";
import { loadContentBundle } from "../../../src/content/repository.node";
import { REPOSITORY_ROOT } from "../content/fixtures";

describe("Portfolio V4 shell primitives", () => {
  it("renders canonical navigation and profile content without inventing routes", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const markup = renderToStaticMarkup(
      createElement(
        PortfolioShell,
        {
          basePath: "/preview",
          currentPath: "/work/fradium",
          navigation: content.navigation,
          profile: content.profile,
        },
        createElement("main", { id: "portfolio-main" }, "Portfolio content"),
      ),
    );

    expect(markup).toContain('data-portfolio-v4="true"');
    expect(markup).toContain('href="#portfolio-main"');
    expect(markup).toContain(content.profile.name);
    expect(markup).toContain("AI Researcher");
    expect(markup).toContain('href="/preview"');
    expect(markup).toContain('href="/preview/work"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="https://github.com/wildanniam"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('href="/preview/moments"');
  });

  it("exposes native dialog controls for predictable mobile Escape and focus behavior", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const markup = renderToStaticMarkup(
      createElement(
        PortfolioShell,
        {
          currentPath: "/",
          navigation: content.navigation,
          profile: content.profile,
        },
        createElement("main", { id: "portfolio-main" }),
      ),
    );

    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls=');
    expect(markup).toContain('aria-label="Open navigation"');
    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-label="Close navigation"');
    expect(markup).toContain('aria-label="Mobile navigation"');
  });
});
