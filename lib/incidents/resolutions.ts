import { createClient } from "@/lib/supabase/server";
import { attachSignedMediaUrls, type IncidentMediaWithUrl } from "@/lib/storage";
import type { IncidentMedia, ResolutionRecord } from "@/types";

export interface ResolutionDocumentation {
  record: ResolutionRecord;
  authority_name: string | null;
  before: IncidentMediaWithUrl | null;
  after: IncidentMediaWithUrl | null;
}

export async function getIncidentResolution(
  incidentId: string
): Promise<ResolutionDocumentation | null> {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("resolution_records")
    .select(
      "id, incident_id, authority_id, description, before_media_id, after_media_id, resolved_at, created_at"
    )
    .eq("incident_id", incidentId)
    .maybeSingle();

  if (error || !record) {
    return null;
  }

  const mediaIds = [record.before_media_id, record.after_media_id].filter(
    (id): id is string => Boolean(id)
  );

  let mediaById = new Map<string, IncidentMediaWithUrl>();

  if (mediaIds.length > 0) {
    const { data: media } = await supabase
      .from("incident_media")
      .select("*")
      .in("id", mediaIds);

    if (media && media.length > 0) {
      const withUrls = await attachSignedMediaUrls(
        supabase,
        media as IncidentMedia[]
      );
      mediaById = new Map(withUrls.map((item) => [item.id, item]));
    }
  }

  let authorityName: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", record.authority_id)
    .maybeSingle();

  if (profile?.full_name) {
    authorityName = profile.full_name;
  }

  return {
    record: record as ResolutionRecord,
    authority_name: authorityName,
    before: record.before_media_id
      ? (mediaById.get(record.before_media_id) ?? null)
      : null,
    after: record.after_media_id
      ? (mediaById.get(record.after_media_id) ?? null)
      : null,
  };
}

export async function getPrimaryCitizenEvidence(
  incidentId: string
): Promise<IncidentMediaWithUrl | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incident_media")
    .select("*")
    .eq("incident_id", incidentId)
    .eq("media_source", "citizen_evidence")
    .order("uploaded_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const [withUrl] = await attachSignedMediaUrls(supabase, [data as IncidentMedia]);
  return withUrl ?? null;
}
