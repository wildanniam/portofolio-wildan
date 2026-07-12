import type { MomentRecord } from "./types";

export const MINIMUM_MOMENTS_FOR_NARRATIVE = 2;

type MomentNarrativeIdentity = Pick<
  MomentRecord,
  "date" | "event" | "place"
>;

function normalizeNarrativeText(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");
}

/**
 * One shared identity keeps route selection and publication validation from
 * disagreeing over whitespace, case, or Unicode presentation differences.
 */
export function momentNarrativeKey(moment: MomentNarrativeIdentity): string {
  return [moment.date, moment.event, moment.place]
    .map(normalizeNarrativeText)
    .join("\u0000");
}

export function hasMinimumMomentNarrative(
  moments: readonly MomentNarrativeIdentity[],
): boolean {
  return (
    new Set(moments.map(momentNarrativeKey)).size >=
    MINIMUM_MOMENTS_FOR_NARRATIVE
  );
}

/**
 * Moments routes are newest-first. IDs are the stable tie-break so filesystem
 * enumeration cannot change the sequence. Records that share a narrative key
 * remain in the returned sequence; the key is a route gate, not a deduper.
 */
export function orderMomentsForNarrative(
  moments: readonly MomentRecord[],
): MomentRecord[] {
  return [...moments].sort(
    (left, right) =>
      right.date.localeCompare(left.date) || left.id.localeCompare(right.id),
  );
}
