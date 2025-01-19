"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Mail, Check, X, Share2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "event_invitation"
    | "event_updated"
    | "event_deleted"
    | "calendar_shared"
    | "calendar_invitation_accepted"
    | "calendar_invitation_declined";
  created_at: string;
  read: boolean;
  metadata: {
    event_id?: string;
    calendar_id?: string;
    sender_email?: string;
    inviter_id?: string;
    accepter_email?: string;
    decliner_email?: string;
  };
}

interface NotificationsListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsListDialog({
  isOpen,
  onOpenChange,
}: NotificationsListDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
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
      toast.error("Kunne ikke hente notifikationer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
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

      toast.success("Alle notifikationer markeret som læst");
      fetchNotifications();
    } catch (error) {
      console.error("Fejl ved markering af notifikationer som læst:", error);
      toast.error("Kunne ikke markere notifikationer som læst");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Notifikation slettet");
      fetchNotifications();
    } catch (error) {
      console.error("Fejl ved sletning af notifikation:", error);
      toast.error("Kunne ikke slette notifikation");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Notifikation markeret som læst");
      fetchNotifications();
    } catch (error) {
      console.error("Fejl ved markering af notifikation som læst:", error);
      toast.error("Kunne ikke markere notifikation som læst");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "calendar_shared":
      case "calendar_invitation_accepted":
      case "calendar_invitation_declined":
        return <Share2 className="h-5 w-5" />;
      case "event_invitation":
        return <Mail className="h-5 w-5" />;
      case "event_updated":
        return <Calendar className="h-5 w-5" />;
      case "event_deleted":
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTimeAgo = (date: string) => {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(new Date(date), {
          addSuffix: true,
          locale: da,
        })}
      </div>
    );
  };

  const handleAcceptInvitation = async (notification: Notification) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Accepter invitation via RPC funktion
      const { data, error } = await supabase.rpc("accept_calendar_invitation", {
        p_calendar_id: notification.metadata.calendar_id,
        p_user_id: user.id,
      });

      if (error) {
        console.error("Fejl ved accept af invitation:", error);
        toast.error("Der skete en fejl ved accept af invitationen");
        return;
      }

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // Marker notifikationen som læst
      await markAsRead(notification.id);

      toast.success("Du er nu tilføjet til kalenderen");
      window.location.reload();
    } catch (error) {
      console.error("Fejl ved accept af invitation:", error);
      toast.error("Der skete en fejl ved accept af invitationen");
    }
  };

  const handleDeclineInvitation = async (notification: Notification) => {
    try {
      // Marker bare notifikationen som læst ved afvisning
      await markAsRead(notification.id);
      toast.success("Invitation afvist");
      fetchNotifications();
    } catch (error) {
      console.error("Fejl ved afvisning af invitation:", error);
      toast.error("Der skete en fejl ved afvisning af invitationen");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Notifikationer</DialogTitle>
              <DialogDescription className="text-base">
                Dine seneste notifikationer og opdateringer
              </DialogDescription>
            </div>
            {notifications.some((n) => !n.read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Marker alle som læst
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="relative">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Ingen notifikationer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Du har ingen notifikationer på nuværende tidspunkt
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "relative group transition-all duration-300 hover:shadow-md",
                    !notification.read && "bg-primary/5 ring-1 ring-primary/10"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                          !notification.read
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "text-sm line-clamp-1",
                            !notification.read
                              ? "font-semibold"
                              : "font-medium text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        {getTimeAgo(notification.created_at)}

                        {notification.type === "calendar_shared" &&
                          !notification.read && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8"
                                onClick={() =>
                                  handleAcceptInvitation(notification)
                                }
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() =>
                                  handleDeclineInvitation(notification)
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                Afvis
                              </Button>
                            </div>
                          )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Marker som læst</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Slet notifikation</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
