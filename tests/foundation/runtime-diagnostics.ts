import { expect, type Page, type TestInfo } from "@playwright/test";

type RequestFailure = {
  error: string;
  method: string;
  resourceType: string;
  url: string;
};

type HttpError = {
  resourceType: string;
  status: number;
  url: string;
};

export type RuntimeDiagnostics = {
  consoleErrors: string[];
  httpErrors: HttpError[];
  pageErrors: string[];
  requestFailures: RequestFailure[];
};

type RuntimePolicy = {
  allowJavaScriptDisabledNextChunks?: boolean;
};

export function observeRuntimeDiagnostics(page: Page): RuntimeDiagnostics {
  const diagnostics: RuntimeDiagnostics = {
    consoleErrors: [],
    httpErrors: [],
    pageErrors: [],
    requestFailures: [],
  };

  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    diagnostics.requestFailures.push({
      error: request.failure()?.errorText ?? "unknown request failure",
      method: request.method(),
      resourceType: request.resourceType(),
      url: request.url(),
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      diagnostics.httpErrors.push({
        resourceType: response.request().resourceType(),
        status: response.status(),
        url: response.url(),
      });
    }
  });

  return diagnostics;
}

export async function expectNoRuntimeFailures(
  diagnostics: RuntimeDiagnostics,
  testInfo: TestInfo,
  policy: RuntimePolicy = {},
) {
  await testInfo.attach("runtime-diagnostics", {
    body: Buffer.from(JSON.stringify(diagnostics, null, 2)),
    contentType: "application/json",
  });

  const unexpectedRequestFailures = diagnostics.requestFailures.filter(
    (failure) => {
      if (!policy.allowJavaScriptDisabledNextChunks) return true;

      const url = new URL(failure.url);
      return !(
        failure.error === "csp" &&
        failure.method === "GET" &&
        failure.resourceType === "script" &&
        url.origin === "http://127.0.0.1:3104" &&
        url.pathname.startsWith("/_next/static/chunks/") &&
        url.pathname.endsWith(".js")
      );
    },
  );

  expect(diagnostics.pageErrors, "uncaught page errors").toEqual([]);
  expect(diagnostics.consoleErrors, "console errors").toEqual([]);
  expect(unexpectedRequestFailures, "unexpected failed network requests").toEqual(
    [],
  );
  expect(diagnostics.httpErrors, "HTTP error responses").toEqual([]);
}
