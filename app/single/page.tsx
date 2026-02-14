"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import GameHeader from "@/app/components/GameHeader";
import NumberPad from "@/app/components/NumberPad";
import GuessHistory from "@/app/components/GuessHistory";
import VictoryOverlay from "@/app/components/VictoryOverlay";
import {
  generateRandomNumber,
  checkGuess,
  isValidGuess,
  GuessResult,
} from "@/app/lib/game";

export default function SinglePlayerPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<number[]>(() => generateRandomNumber());
  const [selected, setSelected] = useState<number[]>([]);
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleSelect = useCallback(
    (digit: number) => {
      if (selected.length >= 4 || selected.includes(digit)) return;
      setSelected((prev) => [...prev, digit]);
    },
    [selected],
  );

  const handleDelete = useCallback(() => {
    setSelected((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValidGuess(selected)) {
      setShakeKey((k) => k + 1);
      return;
    }

    const result = checkGuess(secret, selected);
    const guessResult: GuessResult = {
      guess: [...selected],
      strikes: result.strikes,
      balls: result.balls,
    };

    setHistory((prev) => [...prev, guessResult]);
    setSelected([]);

    if (result.strikes === 4) {
      setIsWon(true);
    }
  }, [selected, secret]);

  const handleReset = useCallback(() => {
    setSecret(generateRandomNumber());
    setSelected([]);
    setHistory([]);
    setIsWon(false);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-3xl animate-fade-in">
        {/* Header */}
        <GameHeader
          title="1인용 모드"
          subtitle="컴퓨터의 숫자를 맞춰보세요"
          onReset={handleReset}
        >
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)]">시도</span>
              <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                {history.length}
              </span>
            </div>
            <div className="w-px h-4 bg-[var(--border)]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)]">상태</span>
              <span
                className={`text-xs font-semibold ${isWon
                  ? "text-[var(--success)]"
                  : "text-[var(--text-secondary)]"
                  }`}
              >
                {isWon
                  ? "정답!"
                  : history.length === 0
                    ? "시작하세요"
                    : "진행 중"}
              </span>
            </div>
          </div>
        </GameHeader>

        {/* Two-column: Input (left) + History (right) */}
        <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
          {/* Left: Number Pad */}
          <div className="w-full md:w-[360px] md:shrink-0">
            <div key={`${resetKey}-${shakeKey}`} className={shakeKey > 0 ? "animate-shake" : resetKey > 0 ? "animate-fade-in-scale" : ""}>
              <NumberPad
                selected={selected}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                disabled={isWon}
              />
            </div>
          </div>

          {/* Right: Guess History */}
          <div className="w-full md:flex-1 md:min-w-0">
            <div className="md:sticky md:top-8">
              <GuessHistory history={history} />
            </div>
          </div>
        </div>
      </div>

      {/* Victory */}
      {isWon && (
        <VictoryOverlay
          winner="플레이어"
          attempts={history.length}
          answer={secret}
          onPlayAgain={handleReset}
          onHome={() => router.push("/")}
        />
      )}
    </main>
  );
}
