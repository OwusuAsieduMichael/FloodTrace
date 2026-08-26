export type {
  UserRole,
  AuthorityStatus,
  IncidentType,
  IncidentStatus,
  IncidentSeverity,
  MediaSource,
  Profile,
  Incident,
  IncidentMedia,
  SupportingReport,
  IncidentStatusHistory,
  AuthorityAssignment,
  ResolutionRecord,
  Notification,
  AppConfig,
  IncidentSummary,
  EmergencyContact,
  DuplicateDetectionConfig,
} from "./index";

/** Replace with `supabase gen types typescript` output in a later phase. */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: import("./index").Profile };
      incidents: { Row: import("./index").Incident };
      notifications: { Row: import("./index").Notification };
    };
  };
}
