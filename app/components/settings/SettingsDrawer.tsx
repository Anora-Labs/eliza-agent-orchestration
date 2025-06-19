"use client";

import { X } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { 
  BellRing, 
  Moon, 
  LogOut, 
  HelpCircle, 
  FileText, 
  Shield, 
  Gift,
  History
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { playNotificationSound } from "@/lib/audio"
import { toast } from "sonner"
import { APP_VERSION } from "@/lib/config"
import { ChangelogView } from "./ChangelogView"

interface SettingsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDrawer({ 
  isOpen, 
  onOpenChange
}: SettingsDrawerProps) {
  const [notifications, setNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notificationsEnabled');
    const storedSoundEnabled = localStorage.getItem('soundEnabled');
    const storedDarkMode = localStorage.getItem('darkMode');
    
    setNotifications(storedNotifications === 'true');
    setSoundEnabled(storedSoundEnabled === 'true');
    setDarkMode(storedDarkMode === 'true');
  }, []);
  
  // Handle notifications toggle
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('notificationsEnabled', String(checked));
  };
  
  // Handle sound toggle
  const handleSoundChange = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('soundEnabled', String(checked));
    
    // Play a sound when enabling sounds
    if (checked) {
      playNotificationSound();
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', String(checked));
    
    // Apply dark mode to the document
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    console.log("User clicked logout");
    toast.info("You can't logout, sorry. ahaha!");
  };

  const openChangelog = () => {
    setIsChangelogOpen(true);
  };
  
  return (
    <>
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center items-center flex flex-row justify-between px-2 py-2">
              <Button 
                onClick={() => onOpenChange(false)} 
                className=""
                variant="ghost"
                size="icon"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
              <DrawerTitle>Settings</DrawerTitle>
              <div className="w-8"></div> {/* Empty div for balanced layout */}
            </DrawerHeader>
            
            <div className="pt-4 pb-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <Card className="bg-card border-border gap-4 py-4">
                <CardHeader className="pb-0 px-4">
                  <CardTitle className="text-base">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive alerts and updates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={handleNotificationsChange} 
                      aria-label="Toggle notifications"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sound</p>
                        <p className="text-xs text-muted-foreground">Play sounds for notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={soundEnabled} 
                      onCheckedChange={handleSoundChange} 
                      aria-label="Toggle sounds"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dark Mode</p>
                        <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={handleDarkModeChange} 
                      aria-label="Toggle dark mode"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border gap-4 py-4">
                <CardHeader className="pb-0 px-4">
                  <CardTitle className="text-base">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4">
                  <Button variant="outline" className="w-full justify-start text-sm h-auto py-2" size="sm">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Privacy & Security</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start text-sm h-auto py-2" size="sm">
                    <Gift className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Referrals & Credits</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-auto py-2" 
                    size="sm"
                    onClick={openChangelog}
                  >
                    <History className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Changelog</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start text-sm h-auto py-2" size="sm">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Terms & Conditions</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start text-sm h-auto py-2" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Help & Support</span>
                  </Button>
                  
                  <Button 
                      variant="destructive" 
                      className="w-full mt-4 text-sm"
                      onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Reinitialize App</span>
                  </Button>
                </CardContent>
              </Card>
              
              <div className="text-center text-xs text-muted-foreground mt-4">
                <p>App Version {APP_VERSION}</p>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Changelog Drawer */}
      <Drawer open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center items-center flex flex-row justify-between px-2 py-2">
              <Button 
                onClick={() => setIsChangelogOpen(false)} 
                variant="ghost"
                size="icon"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
              <DrawerTitle>Changelog</DrawerTitle>
              <div className="w-8"></div> {/* Empty div for balanced layout */}
            </DrawerHeader>
            
            <div className="p-0 pb-12 overflow-y-auto max-h-[70vh]">
              <ChangelogView />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
} 