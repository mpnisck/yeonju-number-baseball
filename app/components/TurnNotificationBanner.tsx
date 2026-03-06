"use client";

import { useEffect, useState } from "react";

interface TurnNotificationBannerProps {
  isMyTurn: boolean;
  isPlaying: boolean;
}

export default function TurnNotificationBanner({
  isMyTurn,
  isPlaying,
}: TurnNotificationBannerProps) {
  const [visible, setVisible] = useState(false);
  const [prevIsMyTurn, setPrevIsMyTurn] = useState(false);

  if (isMyTurn !== prevIsMyTurn) {
    setPrevIsMyTurn(isMyTurn);
    if (isMyTurn && isPlaying) {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mt-4 flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[var(--strike)]/25 bg-[var(--bg-card)] shadow-lg shadow-black/5 pointer-events-auto">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--strike)] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--strike)]" />
        </span>

        <span className="font-bold text-sm text-[var(--text-primary)]">
          내 차례
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">
          숫자를 추측하세요
        </span>
      </div>
    </div>
  );
}
