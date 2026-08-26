export { DUPLICATE_MATCH_STATUSES } from "./constants";
export { resolveDuplicateDetectionConfig } from "./config";
export { boundingBoxForRadius, distanceMeters } from "./haversine";
export {
  findDuplicateParentIncident,
  type FindDuplicateParentInput,
} from "./find-duplicate";
export {
  processDuplicateDetection,
  type DuplicateDetectionInput,
  type DuplicateDetectionResult,
} from "./process";
