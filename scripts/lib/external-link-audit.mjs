import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const URL_PATTERN = /https?:\/\/[^\s"'<>)}\]]+/g;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const MANUAL_REVIEW_HOSTS = new Map([
  [
    "bse.telkomuniversity.ac.id",
    "The institutional site is intermittently slow or blocks automated clients; verify the article manually when the retrying probe cannot reach it.",
  ],
  [
    "x.com",
    "X commonly blocks automated clients; verify the post manually in a signed-out browser.",
  ],
]);

function normalizePath(path) {
  return path.split(sep).join("/");
}

function sourceFilesBelow(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".yaml") || entry.name.endsWith(".mdx")),
    )
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();
}

function cleanUrlCandidate(candidate) {
  let value = candidate;
  while (/[.,;:]$/.test(value)) value = value.slice(0, -1);
  try {
    return new URL(value).href;
  } catch {
    return null;
  }
}

export function extractExternalLinkReferences(source, file) {
  const references = [];
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const match of line.matchAll(URL_PATTERN)) {
      const url = cleanUrlCandidate(match[0]);
      if (url) references.push({ file, line: index + 1, url });
    }
  });

  return references;
}

export function collectExternalLinks({
  contentDirectory = resolve(process.cwd(), "content"),
  projectRoot = process.cwd(),
} = {}) {
  const byUrl = new Map();

  for (const sourcePath of sourceFilesBelow(contentDirectory)) {
    const file = normalizePath(relative(projectRoot, sourcePath));
    const references = extractExternalLinkReferences(
      readFileSync(sourcePath, "utf8"),
      file,
    );
    for (const reference of references) {
      const existing = byUrl.get(reference.url) ?? [];
      existing.push({ file: reference.file, line: reference.line });
      byUrl.set(reference.url, existing);
    }
  }

  return Array.from(byUrl, ([url, references]) => ({ url, references })).sort(
    (left, right) => left.url.localeCompare(right.url),
  );
}

/**
 * @param {{ error?: string, status?: number, url: string }} input
 */
export function classifyExternalLink({
  error = undefined,
  status = undefined,
  url,
}) {
  const host = new URL(url).hostname.toLowerCase();
  const manualReason = MANUAL_REVIEW_HOSTS.get(host);

  if (!error && typeof status === "number" && status >= 200 && status < 400) {
    return {
      classification: "reachable",
      reason: "HTTP response is reachable.",
    };
  }
  if (manualReason) {
    return { classification: "manual-review", reason: manualReason };
  }
  if (error) {
    return { classification: "failure", reason: error };
  }
  return {
    classification: "failure",
    reason: `Unexpected HTTP status ${String(status)}.`,
  };
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

export async function probeExternalLink(
  url,
  {
    fetchImpl = fetch,
    maxAttempts = 3,
    retryDelayMs = 350,
    timeoutMs = 10_000,
  } = {},
) {
  let lastError;
  let lastResponse;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
          Range: "bytes=0-0",
          "User-Agent":
            "Mozilla/5.0 (compatible; WildanPortfolioReleaseAudit/1.0; +https://wildanniam.dev)",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      lastResponse = response;
      await response.body?.cancel().catch(() => undefined);

      if (!RETRYABLE_STATUS.has(response.status) || attempt === maxAttempts) {
        const classified = classifyExternalLink({
          status: response.status,
          url,
        });
        return {
          ...classified,
          attempts: attempt,
          finalUrl: response.url || url,
          status: response.status,
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === maxAttempts) {
        const classified = classifyExternalLink({ error: lastError, url });
        return {
          ...classified,
          attempts: attempt,
          error: lastError,
        };
      }
    } finally {
      clearTimeout(timeout);
    }

    await delay(retryDelayMs * attempt);
  }

  const error =
    lastError ?? `Unexpected HTTP status ${lastResponse?.status ?? "unknown"}.`;
  return {
    ...classifyExternalLink({ error, status: lastResponse?.status, url }),
    attempts: maxAttempts,
    error,
  };
}

export function summarizeExternalLinkResults(links) {
  const counts = { failure: 0, "manual-review": 0, reachable: 0 };
  for (const link of links) counts[link.classification] += 1;
  return { counts, total: links.length };
}
