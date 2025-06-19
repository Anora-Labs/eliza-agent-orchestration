import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatCenteredText, Microphone, User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface VoiceButtonProps {
  isListening: boolean;
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onClose,
}) => {
  const [showDialog, setShowDialog] = React.useState(false);

  // This button now only triggers the voice mode rather than directly handling voice interaction
  const handleActivateVoice = () => {
    onClose(); // Use the onClose prop to toggle voice mode on
  };

  return (
    <div className="fixed bottom-18 md:bottom-4 right-4 flex flex-col items-end gap-2 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowDialog(true)}
              variant="default"
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg"
            >
              <Microphone className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Voice Agent</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Mode Disabled</DialogTitle>
            <DialogDescription>
              Voice mode is disabled for now. It's too expensive to run. We're working on Stripe integration. Stay tuned!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-xs text-muted-foreground text-center">instead you better try</p>
            <Button asChild variant="default">
              <Link href="/chat" className="flex flex-row gap-1 items-center">
                <ChatCenteredText className="size-4" />
                <span>Chat with AI Agents</span>
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">or</p>
            <Button asChild variant="outline">
              <Link href="/profile" className="flex flex-row gap-1 items-center">
                <User className="size-4" />
                <span>Update Profile & Habits</span>
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceButton;