import React, { useRef, useEffect } from "react";
import { TranscriptItem } from "@/app/types";
import VoiceVisualization from "./VoiceVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react/dist/ssr";
import { SessionStatus } from "@/app/types";
import BottomToolbar from "./BottomToolbar";
import { Markdown } from "@/components/prompt-kit/markdown";

interface VoiceTranscriptOverlayProps {
  isVisible: boolean;
  transcriptItems: TranscriptItem[];
  isAssistantSpeaking: boolean;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  connectionStatus: SessionStatus;
  onClose: () => void;
}

const VoiceTranscriptOverlay: React.FC<VoiceTranscriptOverlayProps> = ({
  isVisible,
  transcriptItems,
  isAssistantSpeaking,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  connectionStatus,
  onClose,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isVisible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptItems, isVisible]);

  // Prevent closing when clicking outside by stopping propagation
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Get only last 10 message items for display
  const recentMessages = transcriptItems
    .filter((item) => item.type === "MESSAGE" && !item.isHidden)
    .slice(-10);
  
  // [Mock data] recentMessages
  // const recentMessages = [
  //   {
  //     itemId: "1",
  //     role: "assistant",
  //     title: "Hello, how can I help you today?",
  //   },
  //   {
  //     itemId: "2",
  //     role: "user",
  //     title: "I need help with my account",
  //   },
  //   {
  //     itemId: "3",
  //     role: "assistant",
  //     title: "I'm sorry, I can't help with that. Please try again.",
  //   },
  //   {
  //     itemId: "4",
  //     role: "user",
  //     title: "I need help with my account",
  //   },
  //   {
  //     itemId: "5",
  //     role: "assistant",
  //     title: "I'm sorry, I can't help with that. Please try again.",
  //   },
  //   {
  //     itemId: "6",
  //     role: "user",
  //     title: "I need help with my account",
  //   },
  //   {
  //     itemId: "7",
  //     role: "assistant",
  //     title: "I'm sorry, I can't help with that. Please try again.",
  //   },
  //   {
  //     itemId: "8",
  //     role: "user",
  //     title: "I need help with my account",
  //   },
  //   {
  //     itemId: "9",
  //     role: "assistant",
  //     title: "I'm sorry, I can't help with that. Please try again.",
  //   },
  // ];

  const isConnected = connectionStatus === "CONNECTED";
  const isConnecting = connectionStatus === "CONNECTING";

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-xs z-40 flex flex-col justify-center items-center px-2">
      <div 
        ref={cardRef} 
        onClick={handleCardClick} 
        className="relative w-full max-w-lg"
      >
        <Button
          onClick={onClose}
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2 rounded-lg shadow-md z-10"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Card className="w-full py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <span>Talk to Wei</span>
              {isConnecting && <span className="text-sm text-muted-foreground">(Connecting...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[70vh] overflow-y-auto" ref={scrollRef}>
              <div className="space-y-4">
                {recentMessages.length > 0 ? (
                  recentMessages.map((item) => (
                    <div 
                      key={item.itemId} 
                      className={`flex items-start gap-3 ${
                        item.role === "assistant" ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      {item.role === "assistant" ? (
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-500 to-rose-500">
                          <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
                          <AvatarFallback>WEI</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/me-icon.jpeg" alt="Me Icon" />
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`p-3 rounded-lg max-w-[80%] ${
                        item.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        <div className="text-sm break-words">
                          <Markdown>{item.title!}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center justify-center text-sm text-muted-foreground pt-10">
                    {isConnected 
                      ? "Ready! Hold the button and speak..."
                      : isConnecting
                        ? "Connecting to voice assistant..."
                        : "Starting up voice assistant..."}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center mt-4 gap-4">
              <VoiceVisualization isAssistantSpeaking={isAssistantSpeaking} />

              {/* Push to Talk Button */}
              <BottomToolbar
                isPTTUserSpeaking={isPTTUserSpeaking}
                handleTalkButtonDown={handleTalkButtonDown}
                handleTalkButtonUp={handleTalkButtonUp}
                isConnected={isConnected}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceTranscriptOverlay; 