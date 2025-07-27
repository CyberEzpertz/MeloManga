"use client";

import { Volume1, Volume2, VolumeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
  disabled,
}: VolumeControlProps) {
  const VolumeIcon =
    volume < 0.5 ? (volume <= 0 ? VolumeOff : Volume1) : Volume2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          disabled={disabled}
        >
          <VolumeIcon className="text-muted-foreground size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-8 p-2" side="top">
        <div className="flex h-32 min-h-0 flex-col py-2">
          <Slider
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            orientation="vertical"
            disabled={disabled}
            className="data-[orientation=vertical]:min-h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
