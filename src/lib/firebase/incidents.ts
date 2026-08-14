import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { INCIDENT_PHOTOS_BUCKET, supabase } from "@/lib/supabase/client";
import type { GeoPoint, IncidentReport, IncidentStatus } from "@/types/domain";

interface NewIncidentInput {
  reporterId: string;
  municipality: string;
  description: string;
  location: GeoPoint;
  photo: File;
}

function toIncident(id: string, data: Record<string, unknown>): IncidentReport {
  return {
    id,
    reporterId: data.reporterId as string,
    status: data.status as IncidentStatus,
    location: data.location as GeoPoint,
    municipality: data.municipality as string,
    description: data.description as string,
    photoUrls: (data.photoUrls as string[]) ?? [],
    primaryReportId: (data.primaryReportId as string | null) ?? null,
    supportingReportIds: (data.supportingReportIds as string[]) ?? [],
    createdAt:
      (data.createdAt as { toMillis?: () => number })?.toMillis?.() ??
      Date.now(),
    updatedAt:
      (data.updatedAt as { toMillis?: () => number })?.toMillis?.() ??
      Date.now(),
    verifiedBy: (data.verifiedBy as string | null) ?? null,
    assignedTo: (data.assignedTo as string | null) ?? null,
    resolvedAt: (data.resolvedAt as number | null) ?? null,
  };
}

export async function createIncidentReport(
  input: NewIncidentInput,
): Promise<string> {
  const incidentsRef = collection(db, "incidents");
  const docRef = await addDoc(incidentsRef, {
    reporterId: input.reporterId,
    status: "SUBMITTED" satisfies IncidentStatus,
    location: input.location,
    municipality: input.municipality,
    description: input.description,
    photoUrls: [],
    primaryReportId: null,
    supportingReportIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    verifiedBy: null,
    assignedTo: null,
    resolvedAt: null,
  });

  const photoPath = `${docRef.id}/${Date.now()}-${input.photo.name}`;
  const { error: uploadError } = await supabase.storage
    .from(INCIDENT_PHOTOS_BUCKET)
    .upload(photoPath, input.photo, { contentType: input.photo.type });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl: photoUrl },
  } = supabase.storage.from(INCIDENT_PHOTOS_BUCKET).getPublicUrl(photoPath);

  await updateDoc(docRef, {
    photoUrls: arrayUnion(photoUrl),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getUserIncidents(uid: string): Promise<IncidentReport[]> {
  const q = query(
    collection(db, "incidents"),
    where("reporterId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toIncident(d.id, d.data()));
}

export async function getIncidents(): Promise<IncidentReport[]> {
  const q = query(
    collection(db, "incidents"),
    orderBy("createdAt", "desc"),
    limit(500),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toIncident(d.id, d.data()));
}

export async function getIncident(id: string): Promise<IncidentReport | null> {
  const snap = await getDoc(doc(db, "incidents", id));
  if (!snap.exists()) return null;
  return toIncident(snap.id, snap.data());
}
