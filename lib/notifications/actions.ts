"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function revalidateNotificationPages() {
  revalidatePath("/citizen", "layout");
  revalidatePath("/authority", "layout");
  revalidatePath("/citizen/notifications");
  revalidatePath("/citizen/dashboard");
  revalidatePath("/authority/notifications");
  revalidatePath("/authority/dashboard");
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  await revalidateNotificationPages();
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  await revalidateNotificationPages();
}

export async function deleteNotification(
  notificationId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sign in to delete notifications." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not delete that notification." };
  }

  await revalidateNotificationPages();
  return { ok: true };
}
