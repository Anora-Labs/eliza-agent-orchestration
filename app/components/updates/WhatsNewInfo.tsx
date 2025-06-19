"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { WhatsNewDrawer } from "@/app/components/updates/WhatsNewDrawer";
import { getLatestVersion } from "@/app/utils/changelogData";

export default function WhatsNewInfo() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const latestVersion = getLatestVersion();
    
    useEffect(() => {
        // Check if the user has seen the latest update
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        
        if (lastSeenVersion !== latestVersion) {
            setIsVisible(true);
        }
    }, [latestVersion]);
    
    const handleDismiss = () => {
        // Mark this version as seen
        localStorage.setItem('lastSeenVersion', latestVersion);
        setIsVisible(false);
    };
    
    const openDrawer = () => {
        setIsDrawerOpen(true);
    };

    if (!isVisible) return null;
    
    return (
        <>
            <div className="w-full bg-card border-b border-border py-2 px-2 flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium">Check out what's new in v{latestVersion}!</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={openDrawer}
                        className="text-xs"
                    >
                        Learn More
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleDismiss}
                    >
                        <X className="size-3" />
                    </Button>
                </div>
            </div>
            
            <WhatsNewDrawer 
                isOpen={isDrawerOpen} 
                onOpenChange={setIsDrawerOpen} 
                onDismiss={handleDismiss}
            />
        </>
    );
}