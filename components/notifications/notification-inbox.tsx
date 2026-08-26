"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Bell } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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
    (
      current: Notification[],
      update: { type: "one"; id: string } | { type: "all" }
    ) => {
      if (update.type === "all") {
        return current.map((item) => ({ ...item, read: true }));
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unread > 0
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : "You are caught up."}
        </p>
        {unread > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            disabled={isPending}
          >
            Mark all as read
          </Button>
        ) : null}
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {items.map((item) => {
          const type = item.type as NotificationType;
          const href = notificationHref(type, item.incident_id, role);
          const label = NOTIFICATION_TYPE_LABELS[type] ?? item.type;

          return (
            <li key={item.id}>
              <Link
                href={href}
                onClick={() => {
                  if (!item.read) {
                    markOne(item.id);
                  }
                }}
                className={cn(
                  "flex gap-3 px-4 py-4 transition-colors hover:bg-muted/40",
                  !item.read && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "mt-2 size-2 shrink-0 rounded-full",
                    item.read ? "bg-border" : "bg-primary"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-1">
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
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
