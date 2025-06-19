"use client";

import { Button } from "@/components/ui/button";
import { Gear } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import SettingsDrawer from "./settings/SettingsDrawer";

interface ButtonSettingsProps {
  className?: string;
}

export default function ButtonSettings({ className }: ButtonSettingsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`${className}`}
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Settings"
      >
        <Gear className="size-4" />
      </Button>
      
      <SettingsDrawer 
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
} 