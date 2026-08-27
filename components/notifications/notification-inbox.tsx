"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions";
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationType,
} from "@/lib/notifications/constants";
import { notificationHref } from "@/lib/notifications/href";
import { formatRelativeDate } from "@/lib/incidents/format";
import { cn } from "@/lib/utils";
import type { Notification, UserRole } from "@/types";

type InboxUpdate =
  | { type: "one"; id: string }
  | { type: "all" }
  | { type: "delete"; id: string };

interface NotificationInboxProps {
  notifications: Notification[];
  role: UserRole;
}

export function NotificationInbox({
  notifications,
  role,
}: NotificationInboxProps) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useOptimistic(
    notifications,
    (current: Notification[], update: InboxUpdate) => {
      if (update.type === "all") {
        return current.map((item) => ({ ...item, read: true }));
      }

      if (update.type === "delete") {
        return current.filter((item) => item.id !== update.id);
      }

      return current.map((item) =>
        item.id === update.id ? { ...item, read: true } : item
      );
    }
  );

  const unread = items.filter((item) => !item.read).length;

  function markOne(id: string) {
    startTransition(async () => {
      setItems({ type: "one", id });
      await markNotificationRead(id);
    });
  }

  function markAll() {
    startTransition(async () => {
      setItems({ type: "all" });
      await markAllNotificationsRead();
    });
  }

  function deleteOne(id: string) {
    startTransition(async () => {
      setItems({ type: "delete", id });
      const result = await deleteNotification(id);

      if (!result.ok) {
        toast.error(result.error);
        throw new Error(result.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="Updates about your reports, rainfall, and incident activity will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="portal-on-photo-muted text-sm">
          {unread > 0
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : "You are caught up."}
        </p>
        {unread > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-11 min-h-11 sm:h-8 sm:min-h-8"
            onClick={markAll}
            disabled={isPending}
          >
            Mark all as read
          </Button>
        ) : null}
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item) => {
          const type = item.type as NotificationType;
          const href = notificationHref(type, item.incident_id, role);
          const label = NOTIFICATION_TYPE_LABELS[type] ?? item.type;

          return (
            <li key={item.id} className={cn("px-4 py-4", !item.read && "bg-primary/5")}>
              <div className="flex gap-3">
                <span
                  className={cn(
                    "mt-2 size-2 shrink-0 rounded-full",
                    item.read ? "bg-border" : "bg-primary"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant={item.read ? "outline" : "secondary"}>
                        {label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(item.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="h-11 min-h-11 flex-1 touch-manipulation sm:h-8 sm:min-h-8 sm:flex-none"
                      render={
                        <Link
                          href={href}
                          onClick={() => {
                            if (!item.read) {
                              markOne(item.id);
                            }
                          }}
                        />
                      }
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-11 min-h-11 flex-1 touch-manipulation sm:h-8 sm:min-h-8 sm:flex-none"
                      onClick={() => deleteOne(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
