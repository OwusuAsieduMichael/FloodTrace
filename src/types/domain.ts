export type UserRole = "citizen" | "authority" | "admin";

export type IncidentStatus =
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "ASSIGNED"
  | "RESOLVED"
  | "REJECTED";

export interface AppUser {
  uid: string;
  role: UserRole;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  municipality: string | null;
  createdAt: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface IncidentReport {
  id: string;
  reporterId: string;
  status: IncidentStatus;
  location: GeoPoint;
  municipality: string;
  description: string;
  photoUrls: string[];
  primaryReportId: string | null;
  supportingReportIds: string[];
  createdAt: number;
  updatedAt: number;
  verifiedBy: string | null;
  assignedTo: string | null;
  resolvedAt: number | null;
}
