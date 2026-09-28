/* eslint-disable */
/**
 * Generated from packages/schemas/src/camera-pose.schema.json - DO NOT EDIT BY HAND.
 * Run `npm run schemas:generate` to regenerate.
 */

/**
 * T_WC(t): device/camera localization within the local AR world frame, with anchor confidence and tracking state (TRD 2.1). Distinct from body-centered skeleton pose - do not conflate the two.
 */
export interface CameraPose {
  cameraPoseId: string;
  sessionId: string;
  timestamp: string;
  /**
   * [x, y, z] in the frame named by the enclosing record's `frame` field.
   *
   * @minItems 3
   * @maxItems 3
   */
  translation: [number, number, number];
  /**
   * [x, y, z, w]
   *
   * @minItems 4
   * @maxItems 4
   */
  rotation: [number, number, number, number];
  anchorConfidence: number;
  /**
   * notAvailable/limited must gate any AR-anchored overlay and any claim that B-frame pose corresponds to a surveyed world location.
   */
  trackingState: "normal" | "limited" | "notAvailable";
}
