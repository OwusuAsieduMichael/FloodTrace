export type UserRole = "citizen" | "authority" | "admin";

export type AuthorityStatus = "pending" | "approved" | "rejected";

export type IncidentType = "flood" | "blocked_drain";

export type IncidentStatus =
  | "submitted"
  | "pending_review"
  | "verified"
  | "assigned"
  | "resolved"
  | "rejected";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type MediaSource = "citizen_evidence" | "authority_resolution";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  authority_status: AuthorityStatus | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  reporter_id: string;
  incident_type: IncidentType;
  description: string | null;
  latitude: number;
  longitude: number;
  location_name: string | null;
  severity: IncidentSeverity;
  captured_at: string;
  submitted_at: string;
  status: IncidentStatus;
  verification_notes: string | null;
  authority_feedback: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  parent_incident_id: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentMedia {
  id: string;
  incident_id: string;
  media_url: string;
  media_type: "image" | "video";
  media_source: MediaSource;
  captured_at: string;
  uploaded_at: string;
  storage_path: string;
  created_at: string;
}

export interface SupportingReport {
  id: string;
  parent_incident_id: string;
  supporting_incident_id: string;
  created_at: string;
}

export interface IncidentStatusHistory {
  id: string;
  incident_id: string;
  previous_status: IncidentStatus | null;
  new_status: IncidentStatus;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
}

export interface AuthorityAssignment {
  id: string;
  incident_id: string;
  authority_id: string;
  assigned_by: string | null;
  notes: string | null;
  is_active: boolean;
  assigned_at: string;
  created_at: string;
}

export interface ResolutionRecord {
  id: string;
  incident_id: string;
  authority_id: string;
  description: string;
  before_media_id: string | null;
  after_media_id: string | null;
  resolved_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  incident_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AppConfig {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
}

export interface IncidentSummary {
  id: string;
  incident_type: IncidentType;
  description: string | null;
  latitude: number;
  longitude: number;
  location_name: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  submitted_at: string;
  resolved_at: string | null;
  is_primary: boolean;
  parent_incident_id: string | null;
  supporting_report_count: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

export interface DuplicateDetectionConfig {
  radius_meters: number;
  time_window_minutes: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherCurrent {
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number | null;
  rainfallMmLastHour: number | null;
  rainfallMmLast3Hours: number | null;
  condition: WeatherCondition;
  observedAt: string;
}

export interface WeatherForecastDay {
  date: string;
  minC: number;
  maxC: number;
  rainfallMm: number;
  condition: WeatherCondition;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  locationName: string;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  source: "openweathermap";
  fetchedAt: string;
}
