"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "@/components/providers/supabase-provider";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "event_invitation"
    | "event_updated"
    | "event_deleted"
    | "calendar_shared";
  created_at: string;
  read: boolean;
  metadata: {
    event_id?: string;
    calendar_id?: string;
    sender_email?: string;
  };
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { supabase } = useSupabase();

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Fejl ved hentning af notifikationer:", error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.length || 0);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          fetchNotifications();

          if (payload.eventType === "INSERT") {
            const notification = payload.new as Notification;
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Fejl ved markering af notifikation som læst:", error);
      return;
    }

    fetchNotifications();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10 hover:text-primary"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Ingen ulæste notifikationer
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex flex-col items-start gap-1 p-3",
                "cursor-pointer transition-colors",
                !notification.read && "bg-primary/5",
                "hover:bg-muted"
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium">
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: da,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {notification.message}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
