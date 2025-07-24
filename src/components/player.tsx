"use client";

import Image from "next/image";
import { useState } from "react";

import { Pause, Play } from "lucide-react";
import ReactPlayer from "react-player";

import { Button } from "./ui/button";

// TODO: This is bare-bones right now.
interface PlayerProps {
  playing?: boolean;
  src?: string;
  onPlayButtonClick?: () => void;
}

export default function Player({
  playing = false,
  src,
  onPlayButtonClick,
}: PlayerProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-[#1F2024] p-2.5">
      <ReactPlayer src={src} style={{ display: "none" }} playing={playing} />

      <div className="flex">
        {/* <Image
          className="rounded-sm"
          src="https://picsum.photos/200/300"
          alt="test"
          width={100}
          height={100}
        /> */}
      </div>

      <Button className="h-8 w-8 p-1" asChild onClick={onPlayButtonClick}>
        {playing ? (
          <Pause fill="#EAF2FF" stroke="#EAF2FF" />
        ) : (
          <Play fill="#EAF2FF" stroke="#EAF2FF" />
        )}
      </Button>
    </div>
  );
}
