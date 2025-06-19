"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { changelogData, getLatestVersion } from "@/app/utils/changelogData";

interface WhatsNewDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

export function WhatsNewDrawer({ isOpen, onOpenChange, onDismiss }: WhatsNewDrawerProps) {
  const latestVersion = getLatestVersion();
  const latestChangelog = changelogData[0];
  
  const handleClose = () => {
    onOpenChange(false);
    onDismiss();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center items-center flex flex-row justify-between px-2 py-2">
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="ghost"
              size="icon"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
            <DrawerTitle>What's New in v{latestChangelog.version}</DrawerTitle>
            <div className="w-8"></div> {/* Empty div for balanced layout */}
          </DrawerHeader>
          
          <div className="p-4 pb-12 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Updates</h3>
                  <span className="text-xs text-muted-foreground">{latestChangelog.releaseDate}</span>
                </div>
                <ul className="space-y-2">
                  {latestChangelog.changes.map((change, index) => (
                    <li key={index} className="flex flex-row items-start gap-2">
                      <span className="text-sm">-</span>
                      <p className="text-sm">{change}</p>
                    </li>
                  ))}
                </ul>
              </section>
              
              {latestChangelog.benefits && (
                <section>
                  <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                  <ul className="space-y-2">
                    {latestChangelog.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-sm">+</span>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              
              {latestChangelog.details && (
                <section>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <p className="text-sm">{latestChangelog.details}</p>
                </section>
              )}
              
              <section className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  You can always view the full changelog in your profile settings.
                </p>
              </section>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 