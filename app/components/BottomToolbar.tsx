import React from "react";
import { Button } from "@/components/ui/button";
import { Microphone, MicrophoneSlash } from "@phosphor-icons/react/dist/ssr";

interface BottomToolbarProps {
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isConnected: boolean;
}

function BottomToolbar({
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isConnected,
}: BottomToolbarProps) {

  return (
    <div className="flex flex-col items-center mt-4 gap-4">
      <Button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          variant={isPTTUserSpeaking ? "destructive" : "default"}
          size="lg"
          className="rounded-full h-10 w-10 shadow-lg"
          disabled={!isConnected}
        >
        {isPTTUserSpeaking ? (
          <MicrophoneSlash className="size-6" />
        ) : (
          <Microphone className="size-6" />
        )}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        {!isConnected 
          ? "Waiting for connection..." 
          : isPTTUserSpeaking 
            ? "Release to stop recording" 
            : "Hold to speak"}
      </p>
    </div>
  );
}

export default BottomToolbar;
