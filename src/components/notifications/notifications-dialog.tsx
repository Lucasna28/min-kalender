"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSupabase } from "@/components/providers/supabase-provider";
import { cn } from "@/lib/utils";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
}

export function NotificationsDialog({
  isOpen,
  onOpenChange,
}: NotificationsDialogProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Hent notifikationer
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Fejl ved hentning af notifikationer:", error);
      toast({
        title: "Fejl",
        description: "Der skete en fejl ved hentning af notifikationer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Marker notifikation som læst
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error("Fejl ved markering af notifikation som læst:", error);
      toast({
        title: "Fejl",
        description: "Der skete en fejl ved markering af notifikation som læst",
        variant: "destructive",
      });
    }
  };

  // Marker alle som læst
  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
      await fetchNotifications();
      toast({
        title: "Succes",
        description: "Alle notifikationer er markeret som læst",
      });
    } catch (error) {
      console.error(
        "Fejl ved markering af alle notifikationer som læst:",
        error
      );
      toast({
        title: "Fejl",
        description:
          "Der skete en fejl ved markering af notifikationer som læst",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hent notifikationer når dialogen åbnes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notifikationer</DialogTitle>
          <DialogDescription>Dine seneste notifikationer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              Ingen notifikationer
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={!notifications.some((n) => !n.read)}
                >
                  Marker alle som læst
                </Button>
              </div>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(!notification.read && "bg-primary/5")}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {notification.title}
                          </CardTitle>
                          <CardDescription>
                            {notification.message}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={notification.read}
                        >
                          {notification.read ? "Læst" : "Marker som læst"}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
