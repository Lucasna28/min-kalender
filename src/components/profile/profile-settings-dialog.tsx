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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Shield, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProfileSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string | null;
}

export function ProfileSettingsDialog({
  isOpen,
  onOpenChange,
  userEmail,
}: ProfileSettingsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const displayName = formData.get("displayName") as string;

      // Her ville vi normalt opdatere profilen i databasen
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simuleret delay

      toast({
        title: "Profil opdateret",
        description: "Dine ændringer er blevet gemt.",
      });
    } catch (error) {
      toast({
        title: "Fejl",
        description: "Der skete en fejl ved opdatering af profilen.",
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
          <DialogTitle>Profil Indstillinger</DialogTitle>
          <DialogDescription>
            Administrer din profil og indstillinger
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifikationer"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifikationer</span>
            </TabsTrigger>
            <TabsTrigger value="sikkerhed" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sikkerhed</span>
            </TabsTrigger>
            <TabsTrigger value="adgang" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Adgang</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profil" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil Information</CardTitle>
                <CardDescription>
                  Opdater din profil information og indstillinger
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/20">
                        <User className="h-10 w-10 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">
                      Skift billede
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="displayName">Visningsnavn</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        placeholder="Dit navn"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userEmail || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Gemmer..." : "Gem ændringer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifikationer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifikationer</CardTitle>
                <CardDescription>
                  Administrer dine notifikationsindstillinger
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email notifikationer</Label>
                    <p className="text-sm text-muted-foreground">
                      Modtag notifikationer på email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Begivenhedspåmindelser</Label>
                    <p className="text-sm text-muted-foreground">
                      Få påmindelser om kommende begivenheder
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invitationer</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifikationer om nye invitationer
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sikkerhed" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sikkerhed</CardTitle>
                <CardDescription>
                  Administrer dine sikkerhedsindstillinger
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>To-faktor autentificering</Label>
                    <p className="text-sm text-muted-foreground">
                      Aktiver to-faktor autentificering for øget sikkerhed
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full">
                  Skift adgangskode
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adgang" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Adgangsindstillinger</CardTitle>
                <CardDescription>
                  Administrer dine adgangsindstillinger og tilladelser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Offentlig profil</Label>
                    <p className="text-sm text-muted-foreground">
                      Lad andre se din profil
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Del kalender</Label>
                    <p className="text-sm text-muted-foreground">
                      Tillad andre at se din kalender
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
