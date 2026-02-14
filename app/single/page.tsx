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
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-md flex flex-col items-center gap-8 animate-fade-in">
        <GameHeader
          title="1인용 모드"
          subtitle="컴퓨터의 숫자를 맞춰보세요"
          onReset={handleReset}
        />

        {/* Status bar */}
        <div className="w-full flex items-center justify-center gap-8 px-6 py-4 rounded-2xl border border-[var(--border)]">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">시도</span>
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {history.length}
            </span>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">상태</span>
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              {isWon
                ? "정답!"
                : history.length === 0
                  ? "시작하세요"
                  : "진행 중"}
            </span>
          </div>
        </div>

        {/* Number Pad */}
        <div key={shakeKey} className={shakeKey > 0 ? "animate-shake" : ""}>
          <NumberPad
            selected={selected}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            disabled={isWon}
          />
        </div>

        {/* History */}
        <GuessHistory history={history} />
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
