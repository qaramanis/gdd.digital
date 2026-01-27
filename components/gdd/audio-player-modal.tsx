"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudioPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioUrl: string | null;
  name: string;
  description?: string | null;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayerModal({
  open,
  onOpenChange,
  audioUrl,
  name,
  description,
}: AudioPlayerModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Callback ref to handle audio element
  const setAudioRef = useCallback((node: HTMLAudioElement | null) => {
    // Cleanup old listeners
    if (audioRef.current) {
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.removeEventListener("durationchange", handleDurationChange);
      audioRef.current.removeEventListener("ended", handleEnded);
      audioRef.current.removeEventListener("canplaythrough", handleCanPlay);
    }

    audioRef.current = node;

    // Setup new listeners
    if (node) {
      node.addEventListener("timeupdate", handleTimeUpdate);
      node.addEventListener("loadedmetadata", handleLoadedMetadata);
      node.addEventListener("durationchange", handleDurationChange);
      node.addEventListener("ended", handleEnded);
      node.addEventListener("canplaythrough", handleCanPlay);

      // Check if already loaded
      if (node.readyState >= 1) {
        handleDurationChange();
      }
    }
  }, []);

  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  function handleLoadedMetadata() {
    handleDurationChange();
  }

  function handleDurationChange() {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        setIsLoaded(true);
      }
    }
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  function handleCanPlay() {
    handleDurationChange();
  }

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoaded(false);
    }
  }, [open]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Error playing audio:", err);
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    const seekTime = value[0];
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  if (!audioUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{name}</DialogTitle>
        </DialogHeader>

        <audio
          ref={setAudioRef}
          src={audioUrl}
          preload="auto"
        />

        <div className="space-y-4 py-2">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <Slider
              value={[currentTime]}
              max={duration > 0 ? duration : 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
              disabled={!isLoaded}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{isLoaded ? formatTime(duration) : "--:--"}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="h-9 w-9"
                  disabled={!isLoaded}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip back 10 seconds</TooltipContent>
            </Tooltip>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-11 w-11 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="h-9 w-9"
                  disabled={!isLoaded}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip forward 10 seconds</TooltipContent>
            </Tooltip>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
