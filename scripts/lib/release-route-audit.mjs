const HTML_CONTENT_TYPE = /(?:text\/html|application\/xhtml\+xml)/i;
const PLACEHOLDER_HREF =
  /(?:^|[\/:._-])(?:todo|tbd|placeholder|replace[-_]?me|example)(?:[\/:._?#-]|$)/i;

export const RELEASE_ROUTE_AUDIT_SCHEMA_VERSION = 1;

function normalizeSpace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function parseAttributes(tag) {
  const attributes = {};
  const source = tag.replace(/^<\/?[^\s>]+/, "").replace(/\/?>$/, "");
  const pattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(pattern)) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes[key] = decodeHtml(value);
  }

  return attributes;
}

function tags(html, name) {
  return Array.from(
    html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi")),
    (match) => parseAttributes(match[0]),
  );
}

function firstContent(html, pattern) {
  const match = html.match(pattern);
  if (!match) return null;
  return normalizeSpace(decodeHtml(match[1].replace(/<[^>]*>/g, " ")));
}

function metaContent(meta, attribute, value) {
  const entry = meta.find(
    (candidate) => candidate[attribute]?.toLowerCase() === value.toLowerCase(),
  );
  return entry?.content ? normalizeSpace(entry.content) : null;
}

export function extractHtmlSignals(html) {
  const meta = tags(html, "meta");
  const links = tags(html, "link");
  const anchors = tags(html, "a")
    .filter((attributes) => Object.hasOwn(attributes, "href"))
    .map((attributes) => attributes.href);
  const ids = Array.from(
    new Set(
      Array.from(
        html.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi),
        (match) => decodeHtml(match[1] ?? match[2] ?? match[3]),
      ),
    ),
  ).sort();
  const canonical = links.find((link) =>
    link.rel?.toLowerCase().split(/\s+/).includes("canonical"),
  );

  return {
    anchors,
    canonical: canonical?.href ?? null,
    description: metaContent(meta, "name", "description"),
    ids,
    openGraph: {
      description: metaContent(meta, "property", "og:description"),
      image: metaContent(meta, "property", "og:image"),
      title: metaContent(meta, "property", "og:title"),
      url: metaContent(meta, "property", "og:url"),
    },
    robots: metaContent(meta, "name", "robots"),
    title: firstContent(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
  };
}

function finding({ code, message, path, severity = "error" }) {
  return { code, message, path, severity };
}

function normalizedPath(url) {
  const suffix = url.search || url.hash ? `${url.search}${url.hash}` : "";
  return `${url.pathname}${suffix}`;
}

function canonicalUrl(origin, path) {
  const url = new URL(path, `${origin}/`);
  url.hash = "";
  url.search = "";
  return url.toString();
}

function resolvedUrl(value, base) {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function decodedFragment(hash) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

function includesDirective(value, directive) {
  return Boolean(
    value
      ?.toLowerCase()
      .split(/[,\s]+/)
      .includes(directive),
  );
}

function inspectHref(rawHref, { pagePath, runtimeOrigin, siteOrigin }) {
  const href = rawHref.trim();
  const findings = [];

  if (!href || href === "#") {
    findings.push(
      finding({
        code: "href.placeholder",
        message: `Placeholder href ${JSON.stringify(rawHref)} is not releasable.`,
        path: pagePath,
      }),
    );
    return { findings, internal: null };
  }

  if (/^(?:javascript|data):/i.test(href) || PLACEHOLDER_HREF.test(href)) {
    findings.push(
      finding({
        code: "href.placeholder",
        message: `Placeholder or unsafe href ${JSON.stringify(rawHref)} is not releasable.`,
        path: pagePath,
      }),
    );
  }

  if (/^(?:mailto|tel):/i.test(href)) return { findings, internal: null };

  let target;
  try {
    target = new URL(href, new URL(pagePath, `${siteOrigin}/`));
  } catch {
    findings.push(
      finding({
        code: "href.invalid",
        message: `Href ${JSON.stringify(rawHref)} is not a valid URL.`,
        path: pagePath,
      }),
    );
    return { findings, internal: null };
  }

  if (
    !/^https?:$/.test(target.protocol) ||
    ![runtimeOrigin, siteOrigin].includes(target.origin)
  ) {
    return { findings, internal: null };
  }

  const fragment = target.hash ? decodedFragment(target.hash) : null;
  if (target.hash && fragment === null) {
    findings.push(
      finding({
        code: "href.fragment-invalid",
        message: `Href ${JSON.stringify(rawHref)} contains an invalid encoded fragment.`,
        path: pagePath,
      }),
    );
  }

  return {
    findings,
    internal: {
      from: pagePath,
      href: rawHref,
      path: normalizedPath(target),
      requestPath: `${target.pathname}${target.search}`,
      fragment,
    },
  };
}

function inspectMetadata({
  classification,
  expectedTitle,
  path,
  signals,
  siteOrigin,
}) {
  const findings = [];
  const requireMetadata = classification !== "withheld";

  if (requireMetadata && !signals.title) {
    findings.push(
      finding({
        code: "metadata.title-missing",
        message: "Document title is missing.",
        path,
      }),
    );
  }
  if (expectedTitle && signals.title !== expectedTitle) {
    findings.push(
      finding({
        code: "metadata.title-mismatch",
        message: `Expected title ${JSON.stringify(expectedTitle)}, received ${JSON.stringify(signals.title)}.`,
        path,
      }),
    );
  }
  if (requireMetadata && !signals.description) {
    findings.push(
      finding({
        code: "metadata.description-missing",
        message: "Meta description is missing.",
        path,
      }),
    );
  }
  if (requireMetadata && !signals.openGraph.title) {
    findings.push(
      finding({
        code: "metadata.og-title-missing",
        message: "Open Graph title is missing.",
        path,
      }),
    );
  }
  if (requireMetadata && !signals.openGraph.description) {
    findings.push(
      finding({
        code: "metadata.og-description-missing",
        message: "Open Graph description is missing.",
        path,
      }),
    );
  }
  if (requireMetadata && !signals.openGraph.image) {
    findings.push(
      finding({
        code: "metadata.og-image-missing",
        message: "Open Graph image is missing.",
        path,
      }),
    );
  } else if (signals.openGraph.image) {
    const imageUrl = resolvedUrl(signals.openGraph.image, `${siteOrigin}/`);
    if (!imageUrl || !/^https?:$/.test(new URL(imageUrl).protocol)) {
      findings.push(
        finding({
          code: "metadata.og-image-invalid",
          message: `Open Graph image ${JSON.stringify(signals.openGraph.image)} is not a valid HTTP(S) URL.`,
          path,
        }),
      );
    }
  }

  if (classification === "public") {
    const expectedCanonical = canonicalUrl(siteOrigin, path);
    if (!signals.canonical) {
      findings.push(
        finding({
          code: "metadata.canonical-missing",
          message: `Public route must declare canonical ${expectedCanonical}.`,
          path,
        }),
      );
    } else if (!resolvedUrl(signals.canonical, `${siteOrigin}/`)) {
      findings.push(
        finding({
          code: "metadata.canonical-invalid",
          message: `Canonical ${JSON.stringify(signals.canonical)} is not a valid URL.`,
          path,
        }),
      );
    } else if (
      resolvedUrl(signals.canonical, `${siteOrigin}/`) !== expectedCanonical
    ) {
      findings.push(
        finding({
          code: "metadata.canonical-mismatch",
          message: `Expected canonical ${expectedCanonical}, received ${signals.canonical}.`,
          path,
        }),
      );
    }

    if (!signals.openGraph.url) {
      findings.push(
        finding({
          code: "metadata.og-url-missing",
          message: `Public route must declare Open Graph URL ${expectedCanonical}.`,
          path,
        }),
      );
    } else if (!resolvedUrl(signals.openGraph.url, `${siteOrigin}/`)) {
      findings.push(
        finding({
          code: "metadata.og-url-invalid",
          message: `Open Graph URL ${JSON.stringify(signals.openGraph.url)} is not valid.`,
          path,
        }),
      );
    } else if (
      resolvedUrl(signals.openGraph.url, `${siteOrigin}/`) !== expectedCanonical
    ) {
      findings.push(
        finding({
          code: "metadata.og-url-mismatch",
          message: `Expected Open Graph URL ${expectedCanonical}, received ${signals.openGraph.url}.`,
          path,
        }),
      );
    }
  }

  return findings;
}

function inspectBoundaries({
  cacheControl,
  classification,
  path,
  robotsHeader,
  signals,
}) {
  const findings = [];
  const privateRoute = classification === "protected";
  const withheldRoute = classification === "withheld";

  if (privateRoute && !cacheControl.toLowerCase().includes("no-store")) {
    findings.push(
      finding({
        code: "boundary.private-cache",
        message:
          "Protected route must return Cache-Control containing no-store.",
        path,
      }),
    );
  }
  if (
    privateRoute &&
    (!includesDirective(robotsHeader, "noindex") ||
      !includesDirective(robotsHeader, "nofollow"))
  ) {
    findings.push(
      finding({
        code: "boundary.private-robots-header",
        message: "Protected route must return X-Robots-Tag: noindex, nofollow.",
        path,
      }),
    );
  }
  if (
    (privateRoute || withheldRoute) &&
    !includesDirective(robotsHeader, "noindex") &&
    !includesDirective(signals.robots, "noindex")
  ) {
    findings.push(
      finding({
        code: "boundary.noindex-missing",
        message: "Protected or withheld route must expose a noindex boundary.",
        path,
      }),
    );
  }
  if (
    classification === "public" &&
    (includesDirective(robotsHeader, "noindex") ||
      includesDirective(signals.robots, "noindex"))
  ) {
    findings.push(
      finding({
        code: "boundary.public-noindex",
        message: "Public route unexpectedly exposes a noindex boundary.",
        path,
      }),
    );
  }

  return findings;
}

async function request(fetchImpl, origin, path) {
  const response = await fetchImpl(new URL(path, `${origin}/`), {
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "manual",
  });
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  return { body, contentType, response };
}

function parseSitemapLocations(xml) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi), (match) =>
    normalizeSpace(decodeHtml(match[1])),
  ).sort();
}

function inspectDiscovery({
  expectedSitemapPaths,
  forbiddenSitemapPrefixes,
  siteOrigin,
  robotsBody,
  robotsStatus,
  sitemapBody,
  sitemapStatus,
}) {
  const findings = [];
  const locations = parseSitemapLocations(sitemapBody);
  const expectedLocations = expectedSitemapPaths
    .map((path) => canonicalUrl(siteOrigin, path))
    .sort();
  const expectedLocationSet = new Set(expectedLocations);

  if (sitemapStatus !== 200) {
    findings.push(
      finding({
        code: "discovery.sitemap-status",
        message: `Expected sitemap status 200, received ${sitemapStatus}.`,
        path: "/sitemap.xml",
      }),
    );
  }
  for (const expected of expectedLocations) {
    if (!locations.includes(expected)) {
      findings.push(
        finding({
          code: "discovery.sitemap-route-missing",
          message: `Sitemap is missing ${expected}.`,
          path: "/sitemap.xml",
        }),
      );
    }
  }
  const seenLocations = new Set();
  for (const location of locations) {
    const parsedLocation = resolvedUrl(location, `${siteOrigin}/`);
    if (!parsedLocation) {
      findings.push(
        finding({
          code: "discovery.sitemap-url-invalid",
          message: `Sitemap location ${JSON.stringify(location)} is not a valid URL.`,
          path: "/sitemap.xml",
        }),
      );
      continue;
    }
    if (!expectedLocationSet.has(parsedLocation)) {
      findings.push(
        finding({
          code: "discovery.sitemap-route-unexpected",
          message: `Sitemap exposes unexpected route ${location}.`,
          path: "/sitemap.xml",
        }),
      );
    }
    if (seenLocations.has(parsedLocation)) {
      findings.push(
        finding({
          code: "discovery.sitemap-route-duplicate",
          message: `Sitemap contains duplicate route ${location}.`,
          path: "/sitemap.xml",
        }),
      );
    }
    seenLocations.add(parsedLocation);
    const locationPath = new URL(parsedLocation).pathname;
    if (
      forbiddenSitemapPrefixes.some((prefix) => locationPath.startsWith(prefix))
    ) {
      findings.push(
        finding({
          code: "discovery.sitemap-private-route",
          message: `Sitemap exposes withheld or protected route ${location}.`,
          path: "/sitemap.xml",
        }),
      );
    }
  }

  if (robotsStatus !== 200) {
    findings.push(
      finding({
        code: "discovery.robots-status",
        message: `Expected robots status 200, received ${robotsStatus}.`,
        path: "/robots.txt",
      }),
    );
  }
  if (!/^\s*user-agent:\s*\*\s*$/im.test(robotsBody)) {
    findings.push(
      finding({
        code: "discovery.robots-user-agent",
        message: "robots.txt is missing the wildcard user-agent policy.",
        path: "/robots.txt",
      }),
    );
  }
  const expectedSitemap = canonicalUrl(siteOrigin, "/sitemap.xml");
  if (!robotsBody.includes(`Sitemap: ${expectedSitemap}`)) {
    findings.push(
      finding({
        code: "discovery.robots-sitemap",
        message: `robots.txt does not advertise ${expectedSitemap}.`,
        path: "/robots.txt",
      }),
    );
  }

  return { findings, locations };
}

function sortedFindings(findings) {
  return findings.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message),
  );
}

export async function auditReleaseRoutes({
  expectedSitemapPaths,
  fetchImpl = fetch,
  forbiddenSitemapPrefixes,
  origin,
  routes,
  siteOrigin = origin,
}) {
  const normalizedOrigin = new URL(origin).origin;
  const normalizedSiteOrigin = new URL(siteOrigin).origin;
  const findings = [];
  const routeResults = [];
  const internalLinks = [];
  const openGraphImages = [];
  const documentCache = new Map();

  const fetchDocument = async (path) => {
    if (!documentCache.has(path)) {
      documentCache.set(
        path,
        request(fetchImpl, normalizedOrigin, path),
      );
    }
    return documentCache.get(path);
  };

  for (const expectation of routes) {
    const { body, contentType, response } = await fetchDocument(
      expectation.path,
    );
    const signals = HTML_CONTENT_TYPE.test(contentType)
      ? extractHtmlSignals(body)
      : extractHtmlSignals("");
    const routeFindings = [];

    if (signals.openGraph.image) {
      const imageUrl = resolvedUrl(
        signals.openGraph.image,
        `${normalizedSiteOrigin}/`,
      );
      if (imageUrl) {
        const parsedImage = new URL(imageUrl);
        if (
          [normalizedOrigin, normalizedSiteOrigin].includes(parsedImage.origin)
        ) {
          openGraphImages.push({
            from: expectation.path,
            path: normalizedPath(parsedImage),
            requestPath: `${parsedImage.pathname}${parsedImage.search}`,
          });
        }
      }
    }

    if (response.status !== expectation.expectedStatus) {
      routeFindings.push(
        finding({
          code: "route.status",
          message: `Expected HTTP ${expectation.expectedStatus}, received ${response.status}.`,
          path: expectation.path,
        }),
      );
    }
    if (!HTML_CONTENT_TYPE.test(contentType)) {
      routeFindings.push(
        finding({
          code: "route.html-content-type",
          message: `Expected an HTML response, received ${contentType || "no Content-Type"}.`,
          path: expectation.path,
        }),
      );
    }

    routeFindings.push(
      ...inspectMetadata({
        classification: expectation.classification,
        expectedTitle: expectation.expectedTitle,
        path: expectation.path,
        signals,
        siteOrigin: normalizedSiteOrigin,
      }),
      ...inspectBoundaries({
        cacheControl: response.headers.get("cache-control") ?? "",
        classification: expectation.classification,
        path: expectation.path,
        robotsHeader: response.headers.get("x-robots-tag") ?? "",
        signals,
      }),
    );

    for (const href of signals.anchors) {
      const inspected = inspectHref(href, {
        pagePath: expectation.path,
        runtimeOrigin: normalizedOrigin,
        siteOrigin: normalizedSiteOrigin,
      });
      routeFindings.push(...inspected.findings);
      if (inspected.internal) {
        internalLinks.push({
          ...inspected.internal,
          sourceClassification: expectation.classification,
        });
        if (
          expectation.classification === "public" &&
          inspected.internal.path.startsWith("/preview/")
        ) {
          routeFindings.push(
            finding({
              code: "href.public-preview-leak",
              message: `Public route links to protected preview ${inspected.internal.path}.`,
              path: expectation.path,
            }),
          );
        }
      }
    }

    findings.push(...routeFindings);
    routeResults.push({
      cacheControl: response.headers.get("cache-control") ?? null,
      classification: expectation.classification,
      expectedStatus: expectation.expectedStatus,
      findings: sortedFindings(routeFindings),
      metadata: {
        canonical: signals.canonical,
        description: signals.description,
        openGraph: signals.openGraph,
        robots: signals.robots,
        title: signals.title,
      },
      path: expectation.path,
      status: response.status,
      xRobotsTag: response.headers.get("x-robots-tag"),
    });
  }

  const uniqueInternalLinks = Array.from(
    new Map(
      internalLinks.map((link) => [`${link.from}\u0000${link.path}`, link]),
    ).values(),
  ).sort(
    (left, right) =>
      left.from.localeCompare(right.from) ||
      left.path.localeCompare(right.path),
  );
  const internalLinkResults = [];
  for (const link of uniqueInternalLinks) {
    const { body, contentType, response } = await fetchDocument(
      link.requestPath,
    );
    let fragmentFound = null;
    if (link.fragment) {
      fragmentFound = HTML_CONTENT_TYPE.test(contentType)
        ? extractHtmlSignals(body).ids.includes(link.fragment)
        : false;
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      findings.push(
        finding({
          code: "href.internal-redirect",
          message: `Internal href ${link.path} returned HTTP ${response.status}${location ? ` to ${location}` : ""}; release links must target their final route directly.`,
          path: link.from,
        }),
      );
    } else if (response.status >= 400) {
      findings.push(
        finding({
          code: "href.internal-status",
          message: `Internal href ${link.path} returned HTTP ${response.status}.`,
          path: link.from,
        }),
      );
    }
    if (link.fragment && !fragmentFound) {
      findings.push(
        finding({
          code: "href.fragment-missing",
          message: `Internal href ${link.path} targets a missing fragment.`,
          path: link.from,
        }),
      );
    }
    internalLinkResults.push({
      fragmentFound,
      from: link.from,
      path: link.path,
      status: response.status,
    });
  }

  const uniqueOpenGraphImages = Array.from(
    new Map(
      openGraphImages.map((image) => [image.requestPath, image]),
    ).values(),
  ).sort((left, right) => left.path.localeCompare(right.path));
  const openGraphImageResults = [];
  for (const image of uniqueOpenGraphImages) {
    const { contentType, response } = await fetchDocument(image.requestPath);
    if (response.status !== 200) {
      findings.push(
        finding({
          code: "metadata.og-image-status",
          message: `Open Graph image ${image.path} returned HTTP ${response.status}.`,
          path: image.from,
        }),
      );
    }
    if (!/^image\//i.test(contentType)) {
      findings.push(
        finding({
          code: "metadata.og-image-content-type",
          message: `Open Graph image ${image.path} returned ${contentType || "no Content-Type"}.`,
          path: image.from,
        }),
      );
    }
    openGraphImageResults.push({
      contentType,
      path: image.path,
      status: response.status,
    });
  }

  const sitemap = await request(
    fetchImpl,
    normalizedOrigin,
    "/sitemap.xml",
  );
  const robots = await request(
    fetchImpl,
    normalizedOrigin,
    "/robots.txt",
  );
  const discovery = inspectDiscovery({
    expectedSitemapPaths,
    forbiddenSitemapPrefixes,
    siteOrigin: normalizedSiteOrigin,
    robotsBody: robots.body,
    robotsStatus: robots.response.status,
    sitemapBody: sitemap.body,
    sitemapStatus: sitemap.response.status,
  });
  findings.push(...discovery.findings);

  const orderedFindings = sortedFindings(findings);
  const errorCount = orderedFindings.filter(
    (entry) => entry.severity === "error",
  ).length;
  const warningCount = orderedFindings.filter(
    (entry) => entry.severity === "warning",
  ).length;

  return {
    schemaVersion: RELEASE_ROUTE_AUDIT_SCHEMA_VERSION,
    origins: {
      runtime: normalizedOrigin,
      site: normalizedSiteOrigin,
    },
    summary: {
      errors: errorCount,
      internalLinks: internalLinkResults.length,
      openGraphImages: openGraphImageResults.length,
      passed: errorCount === 0,
      routes: routeResults.length,
      warnings: warningCount,
    },
    routes: routeResults,
    internalLinks: internalLinkResults,
    openGraphImages: openGraphImageResults,
    discovery: {
      findings: sortedFindings(discovery.findings),
      robotsStatus: robots.response.status,
      sitemapLocations: discovery.locations,
      sitemapStatus: sitemap.response.status,
    },
    findings: orderedFindings,
  };
}
