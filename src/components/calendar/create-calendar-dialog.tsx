"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Info, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Kalendertyper
const CALENDAR_TYPES = [
  { id: "personal", name: "Personlig", emoji: "👤", color: "#4285f4" },
  { id: "work", name: "Arbejde", emoji: "💼", color: "#34A853" },
  { id: "family", name: "Familie", emoji: "👨‍👩‍👧‍👦", color: "#EA4335" },
  { id: "school", name: "Skole", emoji: "📚", color: "#FBBC05" },
  { id: "health", name: "Sundhed", emoji: "🏥", color: "#46BDC6" },
  { id: "hobby", name: "Hobby", emoji: "🎨", color: "#9C27B0" },
  { id: "travel", name: "Rejser", emoji: "✈️", color: "#FF6D00" },
  { id: "other", name: "Andet", emoji: "📅", color: "#607D8B" },
] as const;

// Tilladelsesniveauer
const PERMISSION_LEVELS = [
  {
    id: "view",
    name: "Se begivenheder",
    description: "Kan kun se begivenheder",
  },
  {
    id: "edit",
    name: "Rediger begivenheder",
    description: "Kan redigere begivenheder",
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Fuld adgang til kalenderen",
  },
] as const;

// Prædefinerede farver til farvepaletten
const PREDEFINED_COLORS = [
  "#4285f4", // Blå
  "#34A853", // Grøn
  "#EA4335", // Rød
  "#FBBC05", // Gul
  "#46BDC6", // Turkis
  "#9C27B0", // Lilla
  "#FF6D00", // Orange
  "#607D8B", // Grå
  "#E91E63", // Pink
  "#795548", // Brun
] as const;

interface CreateCalendarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCalendarDialog({
  isOpen,
  onOpenChange,
}: CreateCalendarDialogProps) {
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("personal");
  const [color, setColor] = useState(CALENDAR_TYPES[0].color);
  const [showInSearch, setShowInSearch] = useState(false);
  const [allowInvites, setAllowInvites] = useState(true);
  const [invitations, setInvitations] = useState<
    Array<{ email: string; permission: string }>
  >([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const selectedPermission = "view";
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const selectedType = CALENDAR_TYPES.find((t) => t.id === newType);
    if (selectedType) {
      setColor(selectedType.color);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Tjek om emailen allerede er inviteret
    if (invitations.some((inv) => inv.email === inviteEmail)) {
      toast({
        title: "Allerede inviteret",
        description: "Denne email er allerede inviteret",
        variant: "destructive",
      });
      return;
    }

    setInvitations([
      ...invitations,
      { email: inviteEmail, permission: selectedPermission },
    ]);
    setInviteEmail("");
  };

  const handleRemoveInvitation = (email: string) => {
    setInvitations(invitations.filter((inv) => inv.email !== email));
  };

  const updateInvitationPermission = (email: string, permission: string) => {
    setInvitations(
      invitations.map((inv) =>
        inv.email === email ? { ...inv, permission } : inv
      )
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        title: "Manglende navn",
        description: "Kalenderens navn må ikke være tomt",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: calendar, error: createError } = await supabase
        .from("calendars")
        .insert([
          {
            name,
            description,
            color,
            type,
            is_visible: true,
            is_public: false,
            show_in_search: showInSearch,
            allow_invites: allowInvites,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Fejl ved oprettelse af kalender:", createError);
        toast({
          title: "Fejl ved oprettelse",
          description: "Der skete en fejl ved oprettelse af kalenderen",
          variant: "destructive",
        });
        return;
      }

      // Opret invitationer
      if (invitations.length > 0 && calendar) {
        const { error: shareError } = await supabase.rpc(
          "share_calendar_with_users",
          {
            calendar_id: calendar.id,
            user_emails: invitations.map((inv) => ({
              email: inv.email,
              permission: inv.permission,
            })),
          }
        );

        if (shareError) {
          console.error("Fejl ved deling af kalender:", shareError);
          toast({
            title: "Fejl ved deling",
            description:
              "Kalenderen blev oprettet, men der skete en fejl ved deling",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Kalender oprettet",
        description: "Din nye kalender er blevet oprettet",
      });

      // Nulstil form
      setName("");
      setDescription("");
      setType("personal");
      setColor(CALENDAR_TYPES[0].color);
      setInvitations([]);
      setShowInSearch(false);
      setAllowInvites(true);
      onOpenChange(false);
    } catch (error) {
      console.error("Uventet fejl:", error);
      toast({
        title: "Uventet fejl",
        description: "Der skete en uventet fejl",
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
          <DialogTitle className="text-2xl">Opret ny kalender</DialogTitle>
          <DialogDescription>
            Opret en ny kalender og tilpas den til dine behov
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basis information */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn på kalender</Label>
                <Input
                  id="name"
                  placeholder="F.eks. Familie eller Arbejde"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse (valgfrit)</Label>
                <Textarea
                  id="description"
                  placeholder="Beskriv hvad kalenderen skal bruges til..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALENDAR_TYPES.map((calendarType) => (
                      <SelectItem
                        key={calendarType.id}
                        value={calendarType.id}
                        className="h-11"
                      >
                        <div className="flex items-center gap-2">
                          <span>{calendarType.emoji}</span>
                          <span>{calendarType.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Farve</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all duration-200 hover:scale-110",
                        color === presetColor &&
                          "ring-2 ring-primary ring-offset-2"
                      )}
                      style={{ backgroundColor: presetColor }}
                      title="Vælg farve"
                    />
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-border opacity-0 absolute inset-0"
                    />
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center",
                        "hover:border-primary transition-colors duration-200"
                      )}
                    >
                      <span className="text-xs text-muted-foreground">+</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Vælg en farve til din kalender eller klik på + for at vælge en
                  tilpasset farve
                </p>
              </div>
            </div>
          </div>

          {/* Avancerede indstillinger */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <span>Avancerede indstillinger</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label>Vis i søgning</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Andre kan finde denne kalender via søgning</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lad andre finde kalenderen gennem søgning
                    </p>
                  </div>
                  <Switch
                    checked={showInSearch}
                    onCheckedChange={setShowInSearch}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label>Tillad invitationer</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Andre kan invitere til begivenheder i denne
                              kalender
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tillad andre at invitere til begivenheder
                    </p>
                  </div>
                  <Switch
                    checked={allowInvites}
                    onCheckedChange={setAllowInvites}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sharing" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Del kalender</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Inviter andre (valgfrit)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Indtast email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite(e)}
                      className="h-11"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleInvite}
                      className="h-11"
                    >
                      Tilføj
                    </Button>
                  </div>

                  <AnimatePresence>
                    {invitations.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.email}
                            className="flex items-center justify-between gap-2 bg-secondary/50 p-2 rounded-lg"
                          >
                            <span className="text-sm">{invitation.email}</span>
                            <div className="flex items-center gap-2">
                              <Select
                                value={invitation.permission}
                                onValueChange={(value) =>
                                  updateInvitationPermission(
                                    invitation.email,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PERMISSION_LEVELS.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                      {level.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleRemoveInvitation(invitation.email)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11"
          >
            Annuller
          </Button>
          <Button onClick={handleCreate} disabled={isLoading} className="h-11">
            {isLoading ? "Opretter..." : "Opret kalender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
