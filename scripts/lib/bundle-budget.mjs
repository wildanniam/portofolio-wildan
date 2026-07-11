const DEFAULT_METRIC_LABELS = {
  totalInitialJavaScriptGzipBytes: "Total initial JavaScript",
  manifestInitialJavaScriptGzipBytes: "Manifest initial JavaScript",
  runtimeJavaScriptGzipBytes: "Next runtime JavaScript",
  sharedJavaScriptGzipBytes: "Shared initial JavaScript",
  routeOwnedJavaScriptGzipBytes: "Route-owned JavaScript",
  lazyJavaScriptGzipBytes: "Lazy JavaScript",
  preIntentAdditionalJavaScriptGzipBytes: "Pre-intent additional JavaScript",
  nonBuildJavaScriptTransferBytes: "Non-build JavaScript transfer",
  cssGzipBytes: "Initial CSS",
  initialMediaTransferBytes: "Initial media transfer",
  largestImageTransferBytes: "Largest image transfer",
  initialFontTransferBytes: "Initial font transfer",
  webglContextRequests: "WebGL context requests",
  unexpectedFailedRequestCount: "Unexpected failed requests",
  httpErrorResponseCount: "HTTP error responses",
  pageErrorCount: "Uncaught page errors",
};

const COUNT_METRICS = new Set([
  "unexpectedFailedRequestCount",
  "httpErrorResponseCount",
  "pageErrorCount",
  "webglContextRequests",
]);

function assertFiniteNonNegativeNumber(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a finite, non-negative number.`);
  }
}

export function formatBytes(bytes) {
  assertFiniteNonNegativeNumber(bytes, "bytes");

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(2)} KiB`;
}

export function formatMetric(metric, value) {
  if (COUNT_METRICS.has(metric)) {
    assertFiniteNonNegativeNumber(value, metric);
    return String(value);
  }

  return formatBytes(value);
}

export function evaluateBudget(metrics, limits, labels = DEFAULT_METRIC_LABELS) {
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
    throw new TypeError("metrics must be an object.");
  }

  if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
    throw new TypeError("limits must be an object.");
  }

  const checks = Object.entries(limits).map(([metric, limit]) => {
    assertFiniteNonNegativeNumber(limit, `limits.${metric}`);

    const actual = metrics[metric];
    const label = labels[metric] ?? metric;

    if (actual === undefined) {
      return {
        metric,
        label,
        actual: null,
        limit,
        remaining: null,
        passed: false,
        reason: "metric-missing",
      };
    }

    assertFiniteNonNegativeNumber(actual, `metrics.${metric}`);

    return {
      metric,
      label,
      actual,
      limit,
      remaining: limit - actual,
      passed: actual <= limit,
      reason: actual <= limit ? "within-limit" : "over-limit",
    };
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function classifyNetworkFailures(
  failedRequests,
  origin,
  allowedFailures,
) {
  if (!Array.isArray(failedRequests)) {
    throw new TypeError("failedRequests must be an array.");
  }
  if (typeof origin !== "string" || new URL(origin).origin !== origin) {
    throw new TypeError("origin must be an absolute URL origin.");
  }
  if (!Array.isArray(allowedFailures)) {
    throw new TypeError("allowedFailures must be an array.");
  }

  for (const allowance of allowedFailures) {
    const keys = Object.keys(allowance ?? {}).sort();
    if (
      keys.join(",") !== "errorText,pathname,resourceType" ||
      typeof allowance.pathname !== "string" ||
      !allowance.pathname.startsWith("/") ||
      typeof allowance.resourceType !== "string" ||
      typeof allowance.errorText !== "string"
    ) {
      throw new TypeError(
        "Each allowed failure must contain only pathname, resourceType, and errorText.",
      );
    }
  }

  const classified = { allowed: [], unexpected: [] };
  for (const failure of failedRequests) {
    const requestUrl = new URL(failure.url);
    const isAllowed =
      requestUrl.origin === origin &&
      allowedFailures.some(
        (allowance) =>
          requestUrl.pathname === allowance.pathname &&
          failure.resourceType === allowance.resourceType &&
          failure.errorText === allowance.errorText,
      );
    classified[isAllowed ? "allowed" : "unexpected"].push(failure);
  }

  return classified;
}

export function analyzeResponseOutcomes(responses, failedRequests) {
  if (!Array.isArray(responses)) {
    throw new TypeError("responses must be an array.");
  }
  if (!(failedRequests instanceof Set)) {
    throw new TypeError("failedRequests must be a Set of request objects.");
  }

  const transportSuccessfulResponses = responses.filter(
    (response) => !failedRequests.has(response.request()),
  );

  return {
    httpErrorResponses: classifyHttpErrorResponses(
      transportSuccessfulResponses,
    ),
    uniqueResponses: [
      ...new Map(
        transportSuccessfulResponses.map((response) => [
          response.url(),
          response,
        ]),
      ).values(),
    ],
  };
}

export function uniqueSuccessfulResponses(responses, failedRequests) {
  return analyzeResponseOutcomes(responses, failedRequests).uniqueResponses;
}

export function classifyHttpErrorResponses(responses) {
  if (!Array.isArray(responses)) {
    throw new TypeError("responses must be an array.");
  }

  return responses
    .filter((response) => response.status() >= 400)
    .map((response) => ({
      url: response.url(),
      resourceType: response.request().resourceType(),
      status: response.status(),
    }));
}

function splitRoute(route) {
  if (route === "/") {
    return [];
  }

  return route.split("/").filter(Boolean);
}

export function appManifestKeyToRoutePattern(manifestKey) {
  if (typeof manifestKey !== "string" || !manifestKey.startsWith("/")) {
    throw new TypeError("manifestKey must be an absolute App Router key.");
  }

  const segments = manifestKey
    .replace(/\/(?:page|route)$/, "")
    .split("/")
    .filter(Boolean)
    .filter(
      (segment) =>
        !/^\([^/]+\)$/.test(segment) && !segment.startsWith("@"),
    );

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export function routeMatchesPattern(route, pattern) {
  const routeSegments = splitRoute(route);
  const patternSegments = splitRoute(pattern);

  let routeIndex = 0;

  for (let patternIndex = 0; patternIndex < patternSegments.length; patternIndex += 1) {
    const segment = patternSegments[patternIndex];
    const isOptionalCatchAll = /^\[\[\.\.\.[^\]]+\]\]$/.test(segment);
    const isCatchAll = /^\[\.\.\.[^\]]+\]$/.test(segment);
    const isDynamic = /^\[[^\]]+\]$/.test(segment);

    if (isOptionalCatchAll) {
      return patternIndex === patternSegments.length - 1;
    }

    if (isCatchAll) {
      return (
        patternIndex === patternSegments.length - 1 &&
        routeIndex < routeSegments.length
      );
    }

    if (routeIndex >= routeSegments.length) {
      return false;
    }

    if (!isDynamic && segment !== routeSegments[routeIndex]) {
      return false;
    }

    routeIndex += 1;
  }

  return routeIndex === routeSegments.length;
}

function patternSpecificity(pattern) {
  return splitRoute(pattern).reduce((score, segment) => {
    if (/^\[\[\.\.\./.test(segment)) return score;
    if (/^\[\.\.\./.test(segment)) return score + 1;
    if (/^\[/.test(segment)) return score + 2;
    return score + 4;
  }, 0);
}

export function selectRouteBudget(routes, route) {
  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    throw new TypeError("routes must be an object.");
  }

  if (routes[route]) {
    return { pattern: route, budget: routes[route] };
  }

  const matchingPatterns = Object.keys(routes)
    .filter((pattern) => routeMatchesPattern(route, pattern))
    .sort((a, b) => patternSpecificity(b) - patternSpecificity(a));

  const pattern = matchingPatterns[0];
  return pattern ? { pattern, budget: routes[pattern] } : null;
}

export { DEFAULT_METRIC_LABELS };
