"use client";

import ShareLink from "@/app/components/ShareLink";

interface WaitingOpponentProps {
  roomCode: string;
  message?: string;
  showShareLink?: boolean;
}

export default function WaitingOpponent({
  roomCode,
  message = "상대방을 기다리는 중...",
  showShareLink = true,
}: WaitingOpponentProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-10 animate-fade-in">
      {/* Animated dots */}
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)] animate-bounce-dot" />
        <div
          className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)] animate-bounce-dot"
          style={{ animationDelay: "0.15s" }}
        />
        <div
          className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)] animate-bounce-dot"
          style={{ animationDelay: "0.3s" }}
        />
      </div>

      <p className="text-sm text-[var(--text-secondary)] font-medium">
        {message}
      </p>

      {showShareLink && <ShareLink roomCode={roomCode} />}
    </div>
  );
}
