"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group fixed top-0 left-0 z-40 h-full w-[240px] sm:w-[280px] -translate-x-full border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0 sm:relative sm:translate-x-0",
      className
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-12 sm:h-14 items-center justify-between border-b px-3 sm:px-4",
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto p-3 sm:p-4", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t p-3 sm:p-4", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-0.5 sm:space-y-1", className)}
    {...props}
  />
));
SidebarSection.displayName = "SidebarSection";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "h-7 w-7 sm:h-8 sm:w-8 items-center justify-center sm:hidden",
      className
    )}
    {...props}
  />
));
SidebarTrigger.displayName = "SidebarTrigger";

const sidebarItemVariants = cva(
  "flex items-center gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors hover:bg-accent",
  {
    variants: {
      variant: {
        default: "",
        selected: "bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "selected";
  }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(sidebarItemVariants({ variant }), className)}
    {...props}
  />
));
SidebarItem.displayName = "SidebarItem";

const SidebarItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("h-5 w-5 shrink-0", className)} {...props} />
));
SidebarItemIcon.displayName = "SidebarItemIcon";

const SidebarItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 truncate", className)} {...props} />
));
SidebarItemContent.displayName = "SidebarItemContent";

const SidebarItemAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("ml-auto", className)} {...props} />
));
SidebarItemAction.displayName = "SidebarItemAction";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSection,
  SidebarTrigger,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemContent,
  SidebarItemAction,
};
