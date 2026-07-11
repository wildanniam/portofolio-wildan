import "server-only";

import { cache } from "react";

import { loadContentBundle } from "./repository.node";

/**
 * Filesystem content is loaded once per React server render/build cache scope.
 * Route and component code should consume queries.server.ts instead of this
 * raw bundle so source-path metadata never leaks across a presentation boundary.
 */
export const getContentBundle = cache(() => loadContentBundle());
