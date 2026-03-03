"use client";

import { useState } from "react";
import { IconTrophy, IconHome, IconRefresh } from "@/app/components/Icons";

interface VictoryOverlayProps {
  winner: string;
  attempts: number;
  answer: number[];
  mySecret?: number[] | null;
  opponentSecret?: number[] | null;
  secretLabels?: { my: string; opponent: string };
  onPlayAgain: () => void;
  onHome: () => void;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

export default function VictoryOverlay({
  winner,
  attempts,
  answer,
  mySecret,
  opponentSecret,
  secretLabels,
  onPlayAgain,
  onHome,
}: VictoryOverlayProps) {
  const isMulti = !!(mySecret || opponentSecret);
  const [confetti] = useState<Confetti[]>(() => {
    const colors = [
      "#eab308",
      "#facc15",
      "#fde047",
      "#16a34a",
      "#22c55e",
      "#4ade80",
    ];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
    }));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: "-10px",
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            animation: `confetti-fall ${c.duration}s ease-in ${c.delay}s infinite`,
          }}
        />
      ))}

      <div className="flex flex-col items-center gap-8 bg-white rounded-3xl p-8 sm:p-10 mx-6 max-w-sm w-full animate-bounce-in border border-[var(--border)] shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-[var(--strike)]/10 flex items-center justify-center text-[var(--strike)] animate-float">
          <IconTrophy size={36} />
        </div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
            {winner} 승리!
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">
              {attempts}
            </span>
            번 만에 정답을 맞췄습니다
          </p>
        </div>

        {isMulti ? (
          <div className="flex flex-col gap-4 w-full">
            {mySecret && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{secretLabels?.my ?? "내 숫자"}</span>
                <div className="flex gap-2">
                  {mySecret.map((digit, i) => (
                    <span
                      key={i}
                      className="w-9 h-10 rounded-lg bg-[var(--accent-secondary)]/8 border border-[var(--accent-secondary)]/15 flex items-center justify-center text-base font-bold text-[var(--accent-secondary)] animate-pop-in opacity-0"
                      style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {opponentSecret && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{secretLabels?.opponent ?? "상대 숫자"}</span>
                <div className="flex gap-2">
                  {opponentSecret.map((digit, i) => (
                    <span
                      key={i}
                      className="w-9 h-10 rounded-lg bg-[var(--strike)]/8 border border-[var(--strike)]/15 flex items-center justify-center text-base font-bold text-[var(--strike)] animate-pop-in opacity-0"
                      style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            {answer.map((digit, i) => (
              <span
                key={i}
                className="w-14 h-16 rounded-xl bg-[var(--success)]/8 border border-[var(--success)]/15 flex items-center justify-center text-2xl font-bold text-[var(--success)] animate-pop-in opacity-0"
                style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
              >
                {digit}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onHome}
            className="flex-1 h-12 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <IconHome size={16} />
            <span>홈으로</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-[2] h-12 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-white font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <IconRefresh size={16} />
            <span>다시하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
