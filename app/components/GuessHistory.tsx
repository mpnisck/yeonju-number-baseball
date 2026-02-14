"use client";

import { GuessResult, formatResult } from "@/app/lib/game";

interface GuessHistoryProps {
  history: GuessResult[];
  label?: string;
}

export default function GuessHistory({
  history,
  label = "추측 기록",
}: GuessHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center mb-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <p className="text-xs">아직 추측 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">
          {label}
        </h3>
        <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-input)] px-2.5 py-1 rounded-md">
          {history.length}회
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5">
        {history.map((item, index) => {
          const isAllStrike = item.strikes === 4;
          const isOut = item.strikes === 0 && item.balls === 0;

          return (
            <div
              key={index}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl
                animate-slide-up transition-colors
                ${
                  isAllStrike
                    ? "bg-[var(--success)]/8 border border-[var(--success)]/15"
                    : "bg-[var(--bg-input)]/50 border border-transparent hover:border-[var(--border)]"
                }
              `}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-[var(--text-muted)] w-5 text-right tabular-nums">
                  {index + 1}
                </span>
                <div className="flex gap-2">
                  {item.guess.map((digit, di) => (
                    <span
                      key={di}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isAllStrike
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      }`}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.strikes > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--strike)]/10 text-[var(--strike)] text-xs font-bold">
                    {item.strikes}S
                  </span>
                )}
                {item.balls > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--accent-secondary)]/8 text-[var(--accent-secondary)] text-xs font-bold">
                    {item.balls}B
                  </span>
                )}
                {isOut && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-muted)] text-xs font-bold">
                    {formatResult(0, 0)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
