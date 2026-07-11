export const WIDE_MOTION_QUERY =
  "(min-width: 1120px) and (min-height: 760px) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export type MotionEligibilityInput = {
  height: number;
  pointerFine: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
};

export type MotionEligibility =
  | { eligible: true; reason: null }
  | {
      eligible: false;
      reason:
        | "invalid-geometry"
        | "pointer"
        | "reduced-motion"
        | "save-data"
        | "viewport";
    };

export function evaluateMotionEligibility({
  height,
  pointerFine,
  reducedMotion,
  saveData,
  width,
}: MotionEligibilityInput): MotionEligibility {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return { eligible: false, reason: "invalid-geometry" };
  }
  if (reducedMotion) return { eligible: false, reason: "reduced-motion" };
  if (saveData) return { eligible: false, reason: "save-data" };
  if (!pointerFine) return { eligible: false, reason: "pointer" };
  if (width < 1120 || height < 760) {
    return { eligible: false, reason: "viewport" };
  }
  return { eligible: true, reason: null };
}
