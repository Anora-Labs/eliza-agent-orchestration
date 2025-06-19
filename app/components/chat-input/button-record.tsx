import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  import { Button } from "@/components/ui/button"
  import { Microphone, MicrophoneSlash, Waveform } from "@phosphor-icons/react"
  import React from "react"
  
  type ButtonRecordProps = {
    onStartRecord: () => void
    onStopRecord: () => void
    isPTTUserSpeaking: boolean
    disabled?: boolean
    isConnected: boolean
  }
  
  export function ButtonRecord({
    onStartRecord,
    onStopRecord,
    isPTTUserSpeaking,
    disabled,
    isConnected
  }: ButtonRecordProps) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
            <Button
                onMouseDown={onStartRecord}
                onMouseUp={onStopRecord}
                onTouchStart={onStartRecord}
                onTouchEnd={onStopRecord}
                variant={isPTTUserSpeaking ? "destructive" : "ghost"}
                size="icon"
                className={`border-border dark:bg-transparent size-8 rounded-lg border bg-transparent dark:hover:bg-muted ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={!isConnected}
                aria-label="Start recording"
                >
                {isPTTUserSpeaking ? (
                    <MicrophoneSlash className="size-4" />
                ) : (
                    <Microphone className="size-4" />
                )}
            </Button>
        </TooltipTrigger>
        <TooltipContent>Start recording</TooltipContent>
      </Tooltip>
    )
  } 