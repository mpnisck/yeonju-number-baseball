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
  return (
    <div className="flex flex-col w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase">
          {label}
        </h3>
        <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-input)] px-2.5 py-1 rounded-full tabular-nums">
          {history.length}회
        </span>
      </div>

      {/* Content */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-3.5">
            <svg
              width="20"
              height="20"
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
          <p className="text-sm">숫자를 입력해 게임을 시작하세요</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border)]/60 max-h-[460px] overflow-y-auto">
          {history.map((item, index) => {
            const isAllStrike = item.strikes === 4;
            const isOut = item.strikes === 0 && item.balls === 0;
            const isLatest = index === history.length - 1;

            return (
              <div
                key={index}
                className={`
                  flex items-center justify-between px-5 py-3.5 transition-colors
                  ${isLatest ? "animate-slide-up" : ""}
                  ${
                    isAllStrike
                      ? "bg-[var(--success)]/6"
                      : isLatest
                        ? "bg-[var(--strike)]/[0.03]"
                        : "hover:bg-[var(--bg-secondary)]/50"
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center tabular-nums ${
                      isAllStrike
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex gap-1.5">
                    {item.guess.map((digit, di) => (
                      <span
                        key={di}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isAllStrike
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--bg-input)] text-[var(--text-primary)]"
                        }`}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.strikes > 0 && (
                    <span className="inline-flex items-center min-w-[38px] justify-center px-2.5 py-1 rounded-md bg-[var(--strike)]/10 text-[var(--strike)] text-xs font-bold">
                      {item.strikes}S
                    </span>
                  )}
                  {item.balls > 0 && (
                    <span className="inline-flex items-center min-w-[38px] justify-center px-2.5 py-1 rounded-md bg-[var(--accent-secondary)]/8 text-[var(--accent-secondary)] text-xs font-bold">
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
      )}
    </div>
  );
}
