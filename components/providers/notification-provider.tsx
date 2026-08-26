"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

interface NotificationContextValue {
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
});

interface NotificationProviderProps {
  userId: string;
  initialUnread: number;
  children: ReactNode;
}

export function NotificationProvider({
  userId,
  initialUnread,
  children,
}: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [seenInitialUnread, setSeenInitialUnread] = useState(initialUnread);

  if (seenInitialUnread !== initialUnread) {
    setSeenInitialUnread(initialUnread);
    setUnreadCount(initialUnread);
  }

  useEffect(() => {
    const supabase = createClient();

    async function refreshUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (count !== null) {
        setUnreadCount(count);
      }
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Notification;
          void refreshUnread();
          toast.message(row.title, { description: row.message });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refreshUnread();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const value = useMemo(() => ({ unreadCount }), [unreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useUnreadNotificationCount() {
  return useContext(NotificationContext).unreadCount;
}
