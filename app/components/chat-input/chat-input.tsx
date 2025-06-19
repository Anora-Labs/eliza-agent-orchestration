"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "@phosphor-icons/react/dist/ssr"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { ButtonFileUpload } from "./button-file-upload"
import { ButtonVideoChat } from "./button-video-chat"
import { FileList } from "./file-list"
import { ButtonEmojiPicker } from "./button-emoji-picker"
import { ButtonGifPicker } from "./button-gif-picker"
import { toast } from "sonner"
import { Stop } from "@phosphor-icons/react"
import { ButtonRecord } from "./button-record"
// TODO: in the future we will add video chat
// import { useVideoChat } from "../video-chat/video-chat-provider" 

// TODO: in the future we will add file upload
// Helper function to read file as ArrayBuffer for sending images
// const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       if (reader.result instanceof ArrayBuffer) {
//         resolve(reader.result);
//       } else {
//         reject("Failed to read file as ArrayBuffer.");
//       }
//     };
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(file);
//   });
// };

// Helper to validate image file types
const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

type ChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  isSubmitting?: boolean
  files: File[]
  onFileUpload: (files: File[]) => void
  onFileRemove: (file: File) => void
  stop: () => void
  status?: "submitted" | "streaming" | "ready" | "error"
  connected?: boolean
  partnerDisconnected?: boolean
}

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  stop,
  status,
  connected = true,
  partnerDisconnected = false,
}: ChatInputProps) {
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [pendingAttachmentUrl, setPendingAttachmentUrl] = useState<string | null>(null);
  // TODO: in the future we will add video chat
  // const { startVideoChat, isVideoChatActive } = useVideoChat();
  
  // Reset pending attachment when files are cleared
  useEffect(() => {
    if (files.length === 0 && pendingAttachment !== null) {
      setPendingAttachment(null);
      if (pendingAttachmentUrl) {
        URL.revokeObjectURL(pendingAttachmentUrl);
        setPendingAttachmentUrl(null);
      }
    }
  }, [files.length, pendingAttachment, pendingAttachmentUrl]);
  
  // Additional effect to reset pending attachment when status changes to ready
  useEffect(() => {
    if (status === "ready" && !isSubmitting && pendingAttachment !== null) {
      setPendingAttachment(null);
      if (pendingAttachmentUrl) {
        URL.revokeObjectURL(pendingAttachmentUrl);
        setPendingAttachmentUrl(null);
      }
    }
  }, [status, isSubmitting, pendingAttachment, pendingAttachmentUrl]);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // TODO: in the future we will add reply feedback in the input
  // Display reply feedback in the input
  // useEffect(() => {
  //   if (currentReplyTo !== undefined && textareaRef.current) {
  //     textareaRef.current.placeholder = "Type your reply...";
  //     textareaRef.current.focus();
  //   }
  // }, [currentReplyTo]);

  // Textarea auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };
    
    textarea.addEventListener('input', adjustHeight);
    
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSubmitting) return

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend, isSubmitting]
  )

  const handleInputChange = (newValue: string) => {
    if (pendingAttachment) return; // Disable text input if image is selected
    
    if (newValue.length > 1000) {
      toast("Message too long", { 
        description: "Please keep your message under 1000 characters.",
        duration: 2000,
      });
      return;
    }
    
    onValueChange(newValue);
  };

  // TODO: in the future we will add reply feedback in the input
  // const handleCancelReply = () => {
  //   if (setReplyTo) {
  //     setReplyTo(undefined);
  //   }
  // };

  const handleEmojiClick = (emoji: string) => {
    console.log("Handling emoji click in ChatInput:", emoji);
    if (pendingAttachment) {
      console.log("Ignoring emoji - pending attachment exists");
      return; // Disable emoji if image is selected
    }
    
    try {
      // Get current cursor position
      const cursorPosition = textareaRef.current?.selectionStart || value.length;
      const newValue = value.slice(0, cursorPosition) + emoji + value.slice(cursorPosition);
      
      // Update value
      onValueChange(newValue);
      
      // Focus the textarea and set cursor position after the inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = cursorPosition + emoji.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 10);
    } catch (error) {
      console.error("Error inserting emoji:", error);
    }
  };

  const handleGifSelect = (gif: any) => {
    // Fetch the GIF as a blob
    fetch(gif.images.original.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch GIF: ${response.status} ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Convert blob to file
        const file = new File([blob], `giphy-${gif.id}.gif`, { type: 'image/gif' });
        onFileUpload([file]);
        
        toast.success(
          "GIF selected", {
          description: "GIF ready to send. Click send to share it.",
          duration: 2000,
        });
      })
      .catch(error => {
        toast.error("Failed to load GIF", {
          description: "Please try another one.",
        });
      });
  };

  const handleFileUploadInternal = (files: File[]) => {
    const file = files[0] || null;
    if (!file) return;

    // we support only image files for now
    if (!isValidImageFile(file)) {
      toast.error("Invalid file type", {
        description: "Only JPG, PNG, GIF, and WEBP files are supported.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 5MB.",
      });
      return;
    }

    setPendingAttachment(file);
    setPendingAttachmentUrl(URL.createObjectURL(file));
    onFileUpload(files);
  };

  const handleMainButtonClick = () => {
    if (isSubmitting && status !== "streaming") {
      return;
    }

    if (isSubmitting && status === "streaming") {
      stop();
      return;
    }

    onSend();
  };
  
  // TODO: in the future we will add video chat
  // const handleStartVideoChat = () => {
  //   if (!connected || partnerDisconnected) {
  //     toast.error("Cannot start video chat", {
  //       description: "You need to be connected to start a video chat.",
  //     });
  //     return;
  //   }

  //   if (!partnerId) {
  //     toast.error("Cannot start video chat", {
  //       description: "No partner available for video chat.",
  //     });
  //     return;
  //   }

  //   // Start the video chat with partner info
  //   startVideoChat(
  //     partnerId, 
  //     partnerUsername || "Partner", 
  //     isGroupChat, 
  //     groupCode
  //   );
    
  //   toast.info("Starting video chat", {
  //     description: "Connecting to peer...",
  //   });
  // };

  return (
    <>
      <div className="w-full relative order-2 px-0 sm:px-0 pb-0 md:order-1">
        <PromptInput
          className={`rounded-xl border-input bg-card/80 relative z-10 overflow-hidden border p-0 pb-2 shadow-xs backdrop-blur-xl`}
          maxHeight={200}
          value={value}
          onValueChange={handleInputChange}
        >
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            placeholder={connected ? (files.length > 0 ? "Image selected. Click send to share it." : "Type a message...") : "Connect to start chatting..."}
            onKeyDown={handleKeyDown}
            className="mt-2 ml-2 min-h-[44px] max-h-[150px] text-sm leading-[1.3] sm:text-sm md:text-sm placeholder:text-sm"
            disabled={isSubmitting || files.length > 0 || pendingAttachment !== null}
            ref={textareaRef}
          />
          <PromptInputActions className="mt-1 w-full justify-between px-2">
            <div className="flex gap-2">
              {/* File Upload */}
              <div>
                <ButtonFileUpload
                  onFileUpload={() => {
                    console.log("File upload in chat input");
                    toast.info("File upload is Premium feature");
                    // handleFileUploadInternal
                  }}
                  disabled={isSubmitting || !connected || partnerDisconnected || files.length > 0}
                />
              </div>
              
              {/* Emoji Picker */}
              <div>
                <ButtonEmojiPicker
                  onEmojiSelect={(emoji) => {
                    console.log("Emoji selected in chat input:", emoji);
                    toast.info("Emoji picker is Premium feature");
                    // handleEmojiClick(emoji);
                  }}
                  disabled={isSubmitting && status === "submitted"}
                />
              </div>
              
              {/* GIF Picker */}
              <div>
                <ButtonGifPicker
                  onGifSelect={(gif) => {
                    console.log("GIF selected in chat input:", gif.id);
                    toast.info("GIF picker is Premium feature");
                    // handleGifSelect(gif);
                  }}
                  disabled={isSubmitting && status === "submitted"}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {/* Video Chat Button */}
              <div>
                <ButtonVideoChat
                  onStartVideoChat={() => {
                    toast.info("Video chat is Premium feature");
                  }}
                  disabled={!connected || partnerDisconnected}
                />
              </div>

              {/* Record Button */}
              <div>
                <ButtonRecord
                  onStartRecord={() => {
                    toast.info("Record is Premium feature");
                  }}
                  onStopRecord={() => {
                    toast.info("Record is Premium feature");
                  }}
                  isPTTUserSpeaking={false}
                  isConnected={connected}
                  disabled={!connected || partnerDisconnected}
                />
              </div>
              
              {/* Send Message Button */}
              <PromptInputAction
                tooltip={isSubmitting ? "Stop generating" : (value.length > 0 || files.length > 0 ? "Send message" : "Enter a message")}
              >
                <Button
                  variant="default"
                  size="icon"
                  className={`size-8 rounded-lg transition-all duration-300 ease-out ${isSubmitting && "cursor-wait"} ${(value.length > 0 || files.length > 0) ? "cursor-pointer" : "cursor-not-allowed"}`}
                  onClick={handleMainButtonClick}
                  disabled={!(value.length > 0 || files.length > 0) || !connected || partnerDisconnected || (isSubmitting && status !== "streaming")}
                  type="button"
                  aria-label={isSubmitting && status === "streaming" ? "Stop generating" : "Send message"}
                >
                  {isSubmitting && status === "streaming" ? (
                    <Stop className="size-4" weight="fill"/>
                  ) : (
                    <ArrowUp className="size-4" />
                  )}
                </Button>
              </PromptInputAction>
            </div>
          </PromptInputActions>
        </PromptInput>
      </div>
    </>
  )
}
