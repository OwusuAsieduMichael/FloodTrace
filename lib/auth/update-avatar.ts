"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { uploadAvatar } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export type UpdateAvatarResult =
  | { success: true; avatarUrl: string }
  | { success: false; error: string };

export async function updateAvatar(
  formData: FormData
): Promise<UpdateAvatarResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return { success: false, error: "You must be signed in to update your avatar." };
  }

  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose an image to upload." };
  }

  const supabase = await createClient();

  try {
    const { publicUrl } = await uploadAvatar(supabase, {
      userId: profile.id,
      file,
    });

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    if (error) {
      return {
        success: false,
        error: "Avatar uploaded but profile could not be updated.",
      };
    }

    revalidatePath("/citizen/profile");
    revalidatePath("/citizen/dashboard");

    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to upload avatar. Please try again.",
    };
  }
}
