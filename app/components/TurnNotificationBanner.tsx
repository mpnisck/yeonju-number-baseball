"use client";

import { useEffect, useRef, useState } from "react";

interface TurnNotificationBannerProps {
  isMyTurn: boolean;
  isPlaying: boolean;
}

/**
 * 내 차례가 되면 화면 상단에서 슬라이드 인되는 토스트 배너.
 * 약 2.5초 후 자동으로 사라집니다.
 */
export default function TurnNotificationBanner({
  isMyTurn,
  isPlaying,
}: TurnNotificationBannerProps) {
  const [visible, setVisible] = useState(false);
  const prevMyTurn = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      prevMyTurn.current = isMyTurn;
      return;
    }

    // 내 차례로 전환된 순간에만 표시
    if (isMyTurn && prevMyTurn.current === false) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2500);
      prevMyTurn.current = isMyTurn;
      return () => clearTimeout(timer);
    }

    prevMyTurn.current = isMyTurn;
  }, [isMyTurn, isPlaying]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mt-4 flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[var(--strike)]/25 bg-[var(--bg-card)] shadow-lg shadow-black/5 pointer-events-auto">
        {/* Pulse dot */}
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
