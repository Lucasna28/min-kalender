"use client";

import { useState } from "react";
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Calendar, Mail, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({
  isOpen,
  onOpenChange,
}: NotificationsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateNotifications = async () => {
    setIsLoading(true);
    try {
      // Her ville vi normalt opdatere indstillingerne i databasen
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simuleret delay

      toast({
        title: "Indstillinger opdateret",
        description: "Dine notifikationsindstillinger er blevet gemt.",
      });
    } catch (error) {
      toast({
        title: "Fejl",
        description: "Der skete en fejl ved opdatering af indstillingerne.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notifikationer</DialogTitle>
          <DialogDescription>
            Administrer dine notifikationsindstillinger
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifikationer</CardTitle>
              <CardDescription>
                Håndter hvilke emails du vil modtage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Daglig Oversigt</p>
                    <p className="text-sm text-muted-foreground">
                      Få en daglig email med dagens begivenheder
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Begivenhedspåmindelser</p>
                    <p className="text-sm text-muted-foreground">
                      Modtag påmindelser om kommende begivenheder
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Invitationer</p>
                    <p className="text-sm text-muted-foreground">
                      Få besked når du modtager nye invitationer
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifikationer</CardTitle>
              <CardDescription>Håndter browser notifikationer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Browser Notifikationer</p>
                    <p className="text-sm text-muted-foreground">
                      Modtag notifikationer i din browser
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuller
            </Button>
            <Button onClick={handleUpdateNotifications} disabled={isLoading}>
              {isLoading ? "Gemmer..." : "Gem ændringer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
