import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Temporary compatibility manifest. seed-contract.test.ts requires exact parity
// with the canonical content repository, so a new project cannot drift silently.
export const PREVIEW_CONTENT_SLUGS = [
  "agentpay",
  "crucible",
  "fradium",
  "nova-ai",
  "paygate",
  "quorum",
  "specheal",
] as const;

const PREVIEW_USERNAME = "preview";
const MINIMUM_PREVIEW_TOKEN_LENGTH = 32;

function unavailableDocument(
  status: "401" | "404",
  title: string,
  detail: string,
): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${title}</title>
  </head>
  <body>
    <div data-portfolio-v1 data-site-shell="v1">
      <main>
        <p>${status} / Private preview unavailable.</p>
        <h1>${detail}</h1>
      </main>
    </div>
  </body>
</html>`;
}

function isPreviewEnabled(): boolean {
  const environment = process.env;
  return environment.PORTFOLIO_V1_PREVIEW === "1";
}

function previewToken(): string | undefined {
  const token = process.env.PORTFOLIO_V1_PREVIEW_TOKEN;
  return token && token.length >= MINIMUM_PREVIEW_TOKEN_LENGTH
    ? token
    : undefined;
}

function suppliedBasicToken(request: NextRequest): string | undefined {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return undefined;

  try {
    const credentials = atob(authorization.slice("Basic ".length));
    const separator = credentials.indexOf(":");
    if (separator < 0 || credentials.slice(0, separator) !== PREVIEW_USERNAME) {
      return undefined;
    }
    return credentials.slice(separator + 1);
  } catch {
    return undefined;
  }
}

function tokensMatch(supplied: string | undefined, expected: string): boolean {
  if (!supplied || supplied.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

const PRIVATE_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

function unavailableResponse(title: string, detail: string): NextResponse {
  return new NextResponse(unavailableDocument("404", title, detail), {
    status: 404,
    headers: PRIVATE_RESPONSE_HEADERS,
  });
}

function credentialsRequiredResponse(): NextResponse {
  return new NextResponse(
    unavailableDocument(
      "401",
      "Private preview credentials required",
      "Enter the approved preview credentials to continue.",
    ),
    {
      status: 401,
      headers: {
        ...PRIVATE_RESPONSE_HEADERS,
        "WWW-Authenticate": 'Basic realm="Portfolio V1 preview", charset="UTF-8"',
      },
    },
  );
}

function authenticatedPreviewResponse(): NextResponse {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Authorization");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function hasPreviewAccess(request: NextRequest, expectedToken: string): boolean {
  return tokensMatch(suppliedBasicToken(request), expectedToken);
}

function previewConfigurationUnavailable(): NextResponse {
  return unavailableResponse(
    "Private preview unavailable",
    "This deployment has not configured a valid preview credential.",
  );
}

function previewAccessResponse(request: NextRequest): NextResponse | undefined {
  const expectedToken = previewToken();
  if (!expectedToken) return previewConfigurationUnavailable();
  if (!hasPreviewAccess(request, expectedToken)) {
    return credentialsRequiredResponse();
  }
  return undefined;
}

function unknownProjectResponse(): NextResponse {
  return unavailableResponse(
    "Private preview route not found",
    "This project preview does not exist.",
  );
}

function previewDisabledResponse(): NextResponse {
  return unavailableResponse(
    "Private preview unavailable",
    "This design checkpoint is not enabled on this deployment.",
  );
}

function isKnownContentPath(pathname: string): boolean {
  const contentPrefix = "/preview/open-proving-ground/content/";
  if (!pathname.startsWith(contentPrefix)) return true;

  const slug = pathname.slice(contentPrefix.length);
  return (
    !slug.includes("/") &&
    (PREVIEW_CONTENT_SLUGS as readonly string[]).includes(slug)
  );
}

export function proxy(request: NextRequest) {
  if (!isPreviewEnabled()) return previewDisabledResponse();

  const accessResponse = previewAccessResponse(request);
  if (accessResponse) return accessResponse;

  if (!isKnownContentPath(request.nextUrl.pathname)) {
    return unknownProjectResponse();
  }

  return authenticatedPreviewResponse();
}

export const config = {
  matcher: "/preview/open-proving-ground/:path*",
};
