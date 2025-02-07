"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Share2,
  Trash2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Prædefinerede farver
const PREDEFINED_COLORS = [
  { hex: "#4285f4" },
  { hex: "#34A853" },
  { hex: "#EA4335" },
  { hex: "#FBBC05" },
  { hex: "#46BDC6" },
  { hex: "#9C27B0" },
  { hex: "#FF6D00" },
  { hex: "#607D8B" },
];

interface EditCalendarDialogProps {
  calendar: {
    id: string;
    name: string;
    color: string;
    type?: keyof typeof CALENDAR_TYPES;
    user_id: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCalendarUpdated: () => void;
}

interface SharedUser {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  permission?: string;
}

// Kalender typer
const CALENDAR_TYPES = {
  personal: { name: "Personlig", icon: "👤" },
  work: { name: "Arbejde", icon: "💼" },
  family: { name: "Familie", icon: "👨‍👩‍👧‍👦" },
  travel: { name: "Rejse", icon: "✈️" },
  vacation: { name: "Ferie", icon: "🏖️" },
  school: { name: "Skole", icon: "📚" },
  health: { name: "Sundhed", icon: "❤️" },
  other: { name: "Andet", icon: "📅" },
} as const;

const PERMISSIONS = {
  viewer: {
    label: "Kan se begivenheder",
    value: "viewer",
    description: "Kan kun se begivenheder i kalenderen",
    icon: "👀",
  },
  editor: {
    label: "Kan redigere",
    value: "editor",
    description: "Kan se, oprette og redigere begivenheder",
    icon: "✏️",
  },
  admin: {
    label: "Administrator",
    value: "admin",
    description: "Kan administrere kalenderen og invitere andre",
    icon: "👑",
  },
} as const;

export function EditCalendarDialog({
  calendar,
  isOpen,
  onOpenChange,
  onCalendarUpdated,
}: EditCalendarDialogProps) {
  const [name, setName] = useState(calendar.name);
  const [color, setColor] = useState(calendar.color);
  const [type, setType] = useState<keyof typeof CALENDAR_TYPES>(
    calendar.type || "other"
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermission, setSelectedPermission] =
    useState<string>("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const { supabase } = useSupabase();
  const [showRemoveShareDialog, setShowRemoveShareDialog] = useState<
    string | null
  >(null);
  const [owner, setOwner] = useState<{
    email: string;
    display_name: string | null;
  }>();
  const [currentUserPermission, setCurrentUserPermission] = useState<
    string | null
  >(null);

  const fetchOwner = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_by_id", {
        user_id: calendar.user_id,
      });

      if (error) {
        console.error("Fejl ved hentning af ejer:", error);
        return;
      }

      if (data) {
        setOwner({
          email: data.email,
          display_name: data.display_name,
        });
      }
    } catch (error) {
      console.error("Uventet fejl:", error);
    }
  }, [calendar.user_id, supabase]);

  const fetchSharedUsers = useCallback(async () => {
    try {
      const { data: shares, error: sharesError } = await supabase
        .from("calendar_shares")
        .select(
          `
          email,
          status,
          permission,
          calendar_id
        `
        )
        .eq("calendar_id", calendar.id);

      if (sharesError) {
        console.error("Fejl ved hentning af invitationer:", sharesError);
        toast.error("Kunne ikke hente delte brugere");
        return;
      }

      if (shares) {
        const users = shares.map((share) => ({
          id: share.email,
          email: share.email,
          status: share.status || "pending",
          permission: share.permission || "viewer",
        }));
        setSharedUsers(users);
      }
    } catch (error) {
      console.error("Uventet fejl:", error);
      toast.error("Der skete en uventet fejl");
    }
  }, [calendar.id, supabase]);

  const checkCurrentUserPermission = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const currentUser = session.data.session.user;

      // Hvis brugeren er ejer
      if (calendar.user_id === currentUser.id) {
        setCurrentUserPermission("owner");
        return;
      }

      // Ellers tjek delte tilladelser
      const { data: share, error } = await supabase
        .from("calendar_shares")
        .select("permission")
        .eq("calendar_id", calendar.id)
        .eq("email", currentUser.email)
        .eq("status", "accepted")
        .single();

      if (error) {
        console.error("Fejl ved tjek af tilladelser:", error);
        return;
      }

      if (share) {
        setCurrentUserPermission(share.permission);
      }
    } catch (error) {
      console.error("Uventet fejl:", error);
    }
  }, [calendar.id, calendar.user_id, supabase]);

  // Hent ejer information når dialogen åbnes
  useEffect(() => {
    if (isOpen) {
      fetchOwner();
      fetchSharedUsers();
    }
  }, [isOpen, fetchOwner, fetchSharedUsers]);

  // Hent delte brugere når dialogen åbnes
  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
    }
  }, [isOpen, fetchSharedUsers]);

  // Tjek brugerens tilladelser når dialogen åbnes
  useEffect(() => {
    if (isOpen) {
      checkCurrentUserPermission();
    }
  }, [isOpen, checkCurrentUserPermission]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Hent den aktuelle brugers session
      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        toast.error("Du skal være logget ind for at invitere andre");
        return;
      }

      const currentUser = session.data.session.user;

      // Inviter bruger via RPC funktion med de korrekte parameternavne
      const { error } = await supabase.rpc("invite_user_to_calendar", {
        invitee_email: inviteEmail,
        inviter_id: currentUser.id,
        target_calendar_id: calendar.id,
        permission: selectedPermission,
      });

      if (error) {
        console.error("Fejl ved invitation:", error);
        toast.error("Der skete en fejl ved afsendelse af invitationen");
        return;
      }

      toast.success(`Invitation sendt til ${inviteEmail}`);
      setInviteEmail("");
      fetchSharedUsers();
    } catch (error) {
      console.error("Fejl ved invitation:", error);
      toast.error("Der skete en fejl ved afsendelse af invitationen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      if (isOwner) {
        // Hvis brugeren er ejer, slet hele kalenderen
        const { error } = await supabase
          .from("calendars")
          .delete()
          .eq("id", calendar.id);

        if (error) {
          toast.error("Der skete en fejl ved sletning af kalenderen");
          return;
        }

        toast.success("Kalenderen blev slettet");
        onCalendarUpdated();
      } else {
        // Hvis brugeren er inviteret, fjern kun deres invitation
        const session = await supabase.auth.getSession();
        if (!session.data.session) return;

        const { error } = await supabase.rpc("remove_calendar_share", {
          target_calendar_id: calendar.id,
          invitee_email: session.data.session.user.email,
        });

        if (error) {
          toast.error("Der skete en fejl ved fjernelse af din adgang");
          return;
        }

        toast.success("Du har forladt kalenderen");
        onCalendarUpdated();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Fejl ved sletning:", error);
      toast.error(
        isOwner
          ? "Der skete en fejl ved sletning af kalenderen"
          : "Der skete en fejl ved fjernelse af din adgang"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (email: string) => {
    setShowRemoveShareDialog(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.rpc("remove_calendar_share", {
        target_calendar_id: calendar.id,
        invitee_email: email,
      });

      if (error) {
        console.error("Fejl ved fjernelse af deling:", error);
        toast.error("Der skete en fejl ved fjernelse af deling");
        return;
      }

      toast.success("Deling blev fjernet");
      fetchSharedUsers();
    } catch (error) {
      console.error("Uventet fejl:", error);
      toast.error("Der skete en fejl ved fjernelse af deling");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (
    email: string,
    newPermission: string
  ) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.rpc("update_calendar_share_permission", {
        target_calendar_id: calendar.id,
        target_email: email,
        new_permission: newPermission,
      });

      if (error) {
        console.error("Fejl ved opdatering af tilladelser:", error);
        toast.error("Der skete en fejl ved opdatering af tilladelser");
        return;
      }

      toast.success("Tilladelser blev opdateret");
      fetchSharedUsers();
    } catch (error) {
      console.error("Uventet fejl:", error);
      toast.error("Der skete en fejl ved opdatering af tilladelser");
    } finally {
      setIsLoading(false);
    }
  };

  const canManageSharing =
    currentUserPermission === "owner" || currentUserPermission === "admin";
  const canEditCalendar =
    currentUserPermission === "owner" ||
    currentUserPermission === "admin" ||
    currentUserPermission === "editor";
  const isOwner = currentUserPermission === "owner";

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {isOwner ? "Slet kalender" : "Forlad kalender"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isOwner
                ? "Er du sikker på, at du vil slette denne kalender? Denne handling kan ikke fortrydes, og alle begivenheder i kalenderen vil også blive slettet."
                : "Er du sikker på, at du vil forlade denne kalender? Du vil ikke længere have adgang til begivenhederne i kalenderen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isOwner ? "Slet kalender" : "Forlad kalender"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!showRemoveShareDialog}
        onOpenChange={() => setShowRemoveShareDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Fjern deling
            </AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil fjerne delingen med{" "}
              {showRemoveShareDialog}? Brugeren vil ikke længere have adgang til
              kalenderen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveShare(showRemoveShareDialog!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fjern deling
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md w-[90vw] max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden sm:w-full sm:rounded-lg">
          <div className="p-3 pb-0">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-medium">
                {canEditCalendar ? "Rediger kalender" : "Kalenderdetaljer"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {canEditCalendar
                  ? "Tilpas indstillinger og deling"
                  : "Se kalenderens indstillinger"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs defaultValue="general" className="flex-1">
            <div className="px-3">
              <TabsList className="w-full grid grid-cols-2 gap-2 p-1 h-auto bg-transparent">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 py-1.5 relative group"
                >
                  <Palette className="h-4 w-4" />
                  <span className="font-medium text-xs">Generelt</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sharing"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 py-1.5 relative group"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium text-xs">Deling</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              <TabsContent value="general" className="mt-0 space-y-3">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium">
                      Kalendernavn
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Indtast navn på kalenderen"
                      className="mt-1 h-8 px-2 text-sm"
                      disabled={!canEditCalendar}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Kalendertype</Label>
                    <Select
                      value={type}
                      onValueChange={(v) =>
                        setType(v as keyof typeof CALENDAR_TYPES)
                      }
                      disabled={!canEditCalendar}
                    >
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue>
                          <div className="flex items-center gap-2 text-sm">
                            {CALENDAR_TYPES[type]?.icon}
                            {CALENDAR_TYPES[type]?.name}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CALENDAR_TYPES).map(
                          ([key, { icon }]) => (
                            <SelectItem key={key} value={key} className="h-8">
                              <div className="flex items-center gap-2 text-sm">
                                {icon}
                                {
                                  CALENDAR_TYPES[
                                    key as keyof typeof CALENDAR_TYPES
                                  ].name
                                }
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Farve</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {PREDEFINED_COLORS.map(({ hex }) => (
                        <motion.button
                          key={hex}
                          type="button"
                          className="w-10 h-10 rounded-lg relative group"
                          style={{ backgroundColor: hex }}
                          onClick={() => setColor(hex)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!canEditCalendar}
                        >
                          {color === hex && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
                            >
                              <Check className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sharing" className="mt-0 space-y-3">
                <div className="space-y-3">
                  {owner && (
                    <div className="bg-muted/30 rounded-lg p-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {owner.display_name?.[0]?.toUpperCase() ||
                          owner.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">
                          {owner.display_name || owner.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Ejer af kalenderen
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        👑 Ejer
                      </Badge>
                    </div>
                  )}

                  {canManageSharing && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            Inviter bruger
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Inviter brugere til din kalender
                          </p>
                        </div>
                      </div>

                      <form
                        onSubmit={handleInvite}
                        className="flex flex-col gap-2"
                      >
                        <Input
                          type="email"
                          placeholder="Indtast email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="h-8 px-2 text-sm"
                        />
                        <div className="flex flex-col gap-2">
                          <Select
                            value={selectedPermission}
                            onValueChange={setSelectedPermission}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue>
                                <div className="flex items-center gap-2 text-sm">
                                  {
                                    PERMISSIONS[
                                      selectedPermission as keyof typeof PERMISSIONS
                                    ]?.icon
                                  }
                                  {
                                    PERMISSIONS[
                                      selectedPermission as keyof typeof PERMISSIONS
                                    ]?.label
                                  }
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PERMISSIONS).map(
                                ([key, { label, description, icon }]) => (
                                  <SelectItem
                                    key={key}
                                    value={key}
                                    className="py-2"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{icon}</span>
                                        <span className="font-medium text-sm">
                                          {label}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {description}
                                      </span>
                                    </div>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="submit"
                            disabled={isLoading || !inviteEmail}
                            className="h-8 text-xs gap-1"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                Inviter
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium flex items-center gap-1.5">
                        <Share2 className="h-3 w-3 text-primary" />
                        Delte brugere
                      </h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {sharedUsers.length}{" "}
                        {sharedUsers.length === 1 ? "bruger" : "brugere"}
                      </Badge>
                    </div>

                    <ScrollArea className="h-[180px]">
                      <div className="space-y-1.5">
                        {sharedUsers.map((user) => (
                          <motion.div
                            key={user.email}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-card hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                {user.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium truncate max-w-[150px]">
                                  {user.email}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={
                                      user.status === "accepted"
                                        ? "success"
                                        : user.status === "declined"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-[10px]"
                                  >
                                    {user.status === "accepted"
                                      ? "Accepteret"
                                      : user.status === "declined"
                                      ? "Afvist"
                                      : "Afventer"}
                                  </Badge>
                                  {canManageSharing && (
                                    <Select
                                      value={user.permission}
                                      onValueChange={(value) =>
                                        handleUpdatePermission(
                                          user.email,
                                          value
                                        )
                                      }
                                      disabled={user.status !== "accepted"}
                                    >
                                      <SelectTrigger className="h-5 text-[10px] px-2 gap-1">
                                        <SelectValue>
                                          {
                                            PERMISSIONS[
                                              user.permission as keyof typeof PERMISSIONS
                                            ]?.icon
                                          }
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(PERMISSIONS).map(
                                          ([key, { label, icon }]) => (
                                            <SelectItem
                                              key={key}
                                              value={key}
                                              className="text-[10px] h-7"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span>{icon}</span>
                                                <span>{label}</span>
                                              </div>
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {!canManageSharing && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {
                                        PERMISSIONS[
                                          user.permission as keyof typeof PERMISSIONS
                                        ]?.icon
                                      }
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {canManageSharing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  setShowRemoveShareDialog(user.email)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                        {sharedUsers.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2">
                              <Share2 className="h-4 w-4" />
                            </div>
                            <p className="text-xs font-medium">
                              Ingen delte brugere
                            </p>
                            <p className="text-xs mt-0.5">
                              {canManageSharing
                                ? "Inviter brugere ovenfor"
                                : "Kalenderen er ikke delt med andre"}
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-2 border-t flex flex-col-reverse sm:flex-row items-center justify-between gap-2">
            {(isOwner || currentUserPermission) && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                className="w-full sm:w-auto h-8 text-xs gap-1"
              >
                <Trash2 className="h-3 w-3" />
                {isOwner ? "Slet kalender" : "Forlad kalender"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-8 text-xs"
            >
              Luk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
