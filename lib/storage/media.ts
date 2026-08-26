import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveMediaDisplayUrl } from "./signing";
import type { IncidentMedia } from "@/types";

export type IncidentMediaWithUrl = IncidentMedia & {
  display_url: string | null;
};

export async function attachSignedMediaUrls(
  supabase: SupabaseClient,
  media: IncidentMedia[]
): Promise<IncidentMediaWithUrl[]> {
  return Promise.all(
    media.map(async (item) => {
      const displayUrl = await resolveMediaDisplayUrl(supabase, {
        mediaUrl: item.media_url,
        storagePath: item.storage_path,
        mediaSource: item.media_source,
      });

      return {
        ...item,
        display_url: displayUrl,
      };
    })
  );
}
