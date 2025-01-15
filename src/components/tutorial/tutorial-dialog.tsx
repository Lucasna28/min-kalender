"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Bell,
  User,
  Settings,
  Plus,
  ChevronRight,
  Filter,
  Share2,
} from "lucide-react";

interface TutorialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    title: "Velkommen til din nye kalender!",
    description: "Lad os tage en hurtig rundtur i din nye kalender app.",
    icon: Calendar,
  },
  {
    title: "Skift mellem visninger",
    description:
      "Brug knapperne i sidebaren til at skifte mellem dag, uge, måned og år visning.",
    icon: Calendar,
  },
  {
    title: "Opret begivenheder",
    description:
      "Klik på '+' knappen eller direkte i kalenderen for at oprette en ny begivenhed.",
    icon: Plus,
  },
  {
    title: "Naviger i kalenderen",
    description:
      "Brug pilene øverst til at skifte måned, eller klik 'I dag' for at komme tilbage til dags dato.",
    icon: ChevronRight,
  },
  {
    title: "Filtrer dine kalendere",
    description:
      "Brug sidebaren til at vælge hvilke kalendere du vil se begivenheder fra.",
    icon: Filter,
  },
  {
    title: "Tilpas din profil",
    description:
      "Opdater dine profilindstillinger og tilpas kalenderen til dine behov.",
    icon: User,
  },
  {
    title: "Hold dig opdateret",
    description: "Få notifikationer om vigtige begivenheder og påmindelser.",
    icon: Bell,
  },
  {
    title: "Del din kalender",
    description:
      "Inviter andre til begivenheder og del din kalender med dem du ønsker.",
    icon: Share2,
  },
  {
    title: "Administrer indstillinger",
    description: "Tilpas dine kalendervisninger og andre præferencer.",
    icon: Settings,
  },
];

export function TutorialDialog({
  isOpen,
  onOpenChange,
  onComplete,
  onSkip,
}: TutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep === tutorialSteps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const CurrentIcon = tutorialSteps[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {tutorialSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Trin {currentStep + 1} af {tutorialSteps.length}
          </p>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Spring over
          </Button>
          <Button onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1
              ? "Kom i gang"
              : "Fortsæt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
