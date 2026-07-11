import { z } from "zod";

import {
  AssetLicenseManifestSchema,
  ContentBundleSchema,
  CurrentlyBuildingRecordSchema,
  CurrentlyBuildingSchema,
  HomepageSchema,
  MomentRecordSchema,
  NavigationSchema,
  ProfileSchema,
  ProjectRecordSchema,
  VerifiedClaimSchema,
} from "./schema";
import type {
  AssetLicenseManifest,
  ContentBundle,
  CurrentlyBuilding,
  CurrentlyBuildingRecord,
  Homepage,
  JsonValue,
  MomentRecord,
  Navigation,
  Profile,
  ProjectRecord,
  VerifiedClaim,
} from "./types";

const OMIT = Symbol("omit-json-undefined");

export class NonJsonSafeContentError extends TypeError {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "NonJsonSafeContentError";
    this.path = path;
  }
}

function normalizeJsonValue(value: unknown, path: string): JsonValue | typeof OMIT {
  if (value === undefined) return OMIT;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new NonJsonSafeContentError(path, "numbers must be finite");
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      const normalized = normalizeJsonValue(entry, `${path}[${index}]`);
      if (normalized === OMIT) {
        throw new NonJsonSafeContentError(`${path}[${index}]`, "arrays cannot contain undefined");
      }
      return normalized;
    });
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new NonJsonSafeContentError(path, "objects must use a plain JSON prototype");
    }

    const output: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      const normalized = normalizeJsonValue(entry, `${path}.${key}`);
      if (normalized !== OMIT) output[key] = normalized;
    }
    return output;
  }

  throw new NonJsonSafeContentError(path, `unsupported ${typeof value} value`);
}

/**
 * Produces a detached plain JSON value and fails instead of silently coercing
 * dates, functions, bigint values, non-finite numbers, or sparse array data.
 */
export function toJsonSafe<T>(value: T): T {
  const normalized = normalizeJsonValue(value, "$content");
  if (normalized === OMIT) {
    throw new NonJsonSafeContentError("$content", "the root value cannot be undefined");
  }
  return normalized as T;
}

function parseJsonSafe<T>(schema: z.ZodType<T>, input: unknown): T {
  return toJsonSafe(schema.parse(input));
}

export function parseVerifiedClaim(input: unknown): VerifiedClaim {
  return parseJsonSafe(VerifiedClaimSchema, input);
}

export function parseProjectRecord(input: unknown): ProjectRecord {
  return parseJsonSafe(ProjectRecordSchema, input);
}

export function parseMomentRecord(input: unknown): MomentRecord {
  return parseJsonSafe(MomentRecordSchema, input);
}

export function parseProfile(input: unknown): Profile {
  return parseJsonSafe(ProfileSchema, input);
}

export function parseNavigation(input: unknown): Navigation {
  return parseJsonSafe(NavigationSchema, input);
}

export function parseHomepage(input: unknown): Homepage {
  return parseJsonSafe(HomepageSchema, input);
}

export function parseCurrentlyBuildingRecord(input: unknown): CurrentlyBuildingRecord {
  return parseJsonSafe(CurrentlyBuildingRecordSchema, input);
}

export function parseCurrentlyBuilding(input: unknown): CurrentlyBuilding {
  return parseJsonSafe(CurrentlyBuildingSchema, input);
}

export function parseAssetLicenseManifest(input: unknown): AssetLicenseManifest {
  return parseJsonSafe(AssetLicenseManifestSchema, input);
}

export function parseContentBundle(input: unknown): ContentBundle {
  return parseJsonSafe(ContentBundleSchema, input);
}
