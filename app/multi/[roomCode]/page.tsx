"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GameHeader from "@/app/components/GameHeader";
import NumberPad from "@/app/components/NumberPad";
import GuessHistory from "@/app/components/GuessHistory";
import VictoryOverlay from "@/app/components/VictoryOverlay";
import WaitingOpponent from "@/app/components/WaitingOpponent";
import TurnNotificationBanner from "@/app/components/TurnNotificationBanner";
import {
  PlayerIcon,
  IconShield,
  IconWifi,
} from "@/app/components/Icons";
import {
  useMultiplayerGame,
  GameRoom,
} from "@/app/hooks/useMultiplayerGame";
import { useTurnNotification } from "@/app/hooks/useTurnNotification";
import { isValidGuess } from "@/app/lib/game";

function SecretDisplay({
  label,
  secret,
  colorClass,
}: {
  label: string;
  secret: number[];
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <span className="text-xs font-medium text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex gap-1">
        {secret.map((digit, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded ${colorClass} flex items-center justify-center text-[11px] font-bold`}
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}

function TurnIndicatorPill({
  room,
  playerNumber,
  isSpectator,
}: {
  room: GameRoom;
  playerNumber: number | null;
  isSpectator: boolean;
}) {
  return (
    <div className="flex items-center rounded-full border border-[var(--border)] overflow-hidden">
      <div
        className={`flex items-center gap-2 px-5 py-3 transition-all duration-300 ${room.current_turn === 1
          ? isSpectator
            ? "bg-[var(--spectator)] text-white"
            : "bg-[var(--text-primary)] text-white"
          : "text-[var(--text-muted)]"
          }`}
      >
        <PlayerIcon player={1} size={14} />
        <span className="text-sm font-bold">P1</span>
        {!isSpectator && playerNumber === 1 && (
          <span className="text-[10px] opacity-60">(나)</span>
        )}
        <span className="text-[11px] opacity-60 tabular-nums">
          {room.player1_history.length}회
        </span>
      </div>
      <div className="w-px h-5 bg-[var(--border)]" />
      <div
        className={`flex items-center gap-2 px-5 py-3 transition-all duration-300 ${room.current_turn === 2
          ? isSpectator
            ? "bg-[var(--spectator)] text-white"
            : "bg-[var(--text-primary)] text-white"
          : "text-[var(--text-muted)]"
          }`}
      >
        <PlayerIcon player={2} size={14} />
        <span className="text-sm font-bold">P2</span>
        {!isSpectator && playerNumber === 2 && (
          <span className="text-[10px] opacity-60">(나)</span>
        )}
        <span className="text-[11px] opacity-60 tabular-nums">
          {room.player2_history.length}회
        </span>
      </div>
    </div>
  );
}

export default function MultiGamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const router = useRouter();

  const {
    room,
    playerNumber,
    isLoading,
    error,
    isSpectator,
    submitSecret,
    submitGuess,
    isMyTurn,
    myHistory,
    opponentHistory,
    myReady,
    opponentReady,
    isWinner,
    mySecret,
    opponentSecret,
  } = useMultiplayerGame(roomCode);

  const [selected, setSelected] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { requestNotificationPermission } = useTurnNotification({
    isMyTurn,
    isPlaying: room?.status === "playing",
  });

  const handleSelect = useCallback(
    (digit: number) => {
      if (selected.length >= 4 || selected.includes(digit))
        return;
      setSelected(prev => [...prev, digit]);
    },
    [selected]
  );

  const handleDelete = useCallback(() => {
    setSelected(prev => prev.slice(0, -1));
  }, []);

  const handleSecretSubmit = useCallback(async () => {
    if (!isValidGuess(selected)) {
      setShakeKey(k => k + 1);
      return;
    }
    requestNotificationPermission();
    setSubmitting(true);
    const result = await submitSecret(selected);
    if (result.success) {
      setSelected([]);
    } else {
      setShakeKey(k => k + 1);
    }
    setSubmitting(false);
  }, [selected, submitSecret, requestNotificationPermission]);

  const handleGuessSubmit = useCallback(async () => {
    if (!isValidGuess(selected)) {
      setShakeKey(k => k + 1);
      return;
    }
    setSubmitting(true);
    const result = await submitGuess(selected);
    if (result.success) {
      setSelected([]);
    } else {
      setShakeKey(k => k + 1);
    }
    setSubmitting(false);
  }, [selected, submitGuess]);

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
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
          <p className="text-sm text-[var(--text-muted)]">
            접속 중...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 animate-fade-in text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-[var(--danger)]/5 border border-[var(--danger)]/15 flex items-center justify-center text-[var(--danger)]">
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              접속 오류
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {error}
            </p>
          </div>
          <button
            onClick={() => router.push("/multi")}
            className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-semibold text-sm transition-all cursor-pointer hover:border-[var(--border-hover)] hover:bg-[var(--bg-input)]"
          >
            로비로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (!room || (!playerNumber && !isSpectator)) return null;

  const opponentNum = playerNumber === 1 ? 2 : 1;

  if (isSpectator) {
    if (room.status === "waiting") {
      return (
        <main className="min-h-dvh flex flex-col items-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-sm flex flex-col gap-8 animate-fade-in">
            <GameHeader
              title="온라인 대전"
              subtitle={`방 코드: ${roomCode}`}
              rightContent={
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--spectator-border)] bg-[var(--spectator-soft)] text-[var(--spectator)]">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-xs font-bold">관전 중</span>
                </div>
              }
            />
            <WaitingOpponent
              roomCode={roomCode}
              message="플레이어를 기다리는 중..."
              showShareLink={false}
            />
          </div>
        </main>
      );
    }

    if (room.status === "setup") {
      return (
        <main className="min-h-dvh flex flex-col items-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-sm flex flex-col gap-8 animate-fade-in">
            <GameHeader
              title="온라인 대전"
              subtitle={`방 코드: ${roomCode}`}
              rightContent={
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--spectator-border)] bg-[var(--spectator-soft)] text-[var(--spectator)]">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-xs font-bold">관전 중</span>
                </div>
              }
            />

            <div className="flex flex-col items-center gap-6 py-10">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  비밀 숫자 설정 중
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  양쪽 플레이어가 숫자를 설정하고 있습니다
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <PlayerIcon player={1} size={16} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    P1
                  </span>
                  <span
                    className={`text-xs font-bold ${room.player1_ready ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}
                  >
                    {room.player1_ready
                      ? "준비 완료"
                      : "준비 중..."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayerIcon player={2} size={16} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    P2
                  </span>
                  <span
                    className={`text-xs font-bold ${room.player2_ready ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}
                  >
                    {room.player2_ready
                      ? "준비 완료"
                      : "준비 중..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--spectator)] animate-bounce-dot" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-[var(--spectator)] animate-bounce-dot"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-[var(--spectator)] animate-bounce-dot"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        </main>
      );
    }
  }

  if (!isSpectator) {
    if (room.status === "waiting") {
      return (
        <main className="min-h-dvh flex flex-col items-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-sm flex flex-col gap-8 animate-fade-in">
            <GameHeader
              title="온라인 대전"
              subtitle={`방 코드: ${roomCode}`}
            />

            <div className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)]">
              <PlayerIcon player={playerNumber!} size={16} />
              <span className="text-sm font-bold">
                Player {playerNumber}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                (나)
              </span>
            </div>

            <WaitingOpponent
              roomCode={roomCode}
              message="상대방의 접속을 기다리는 중..."
            />
          </div>
        </main>
      );
    }

    if (room.status === "setup") {
      if (myReady) {
        return (
          <main className="min-h-dvh flex flex-col items-center px-6 py-10 sm:py-16">
            <div className="w-full max-w-sm flex flex-col gap-8 animate-fade-in">
              <GameHeader
                title="온라인 대전"
                subtitle={`방 코드: ${roomCode}`}
              />

              <div className="flex flex-col items-center gap-8 py-10">
                <div className="w-16 h-16 rounded-2xl bg-[var(--success)]/8 border border-[var(--success)]/15 flex items-center justify-center text-[var(--success)]">
                  <IconShield size={28} />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    숫자 설정 완료!
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    상대방이 숫자를 설정하면 게임이 시작됩니다
                  </p>
                </div>

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
              </div>
            </div>
          </main>
        );
      }

      return (
        <main className="min-h-dvh flex flex-col items-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-sm flex flex-col gap-7 animate-fade-in">
            <GameHeader
              title="비밀 숫자 설정"
              subtitle="상대방이 맞춰야 할 숫자를 정하세요"
            />

            <div className="flex items-center justify-center">
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border ${playerNumber === 1
                  ? "border-[var(--border)] text-[var(--text-primary)]"
                  : "border-[var(--strike)]/25 text-[var(--strike)]"
                  }`}
              >
                <PlayerIcon
                  player={playerNumber!}
                  size={18}
                />
                <span className="font-bold text-sm">
                  Player {playerNumber}
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-[var(--text-muted)]">
              중복 없이 4개의 숫자를 선택하세요
            </div>

            {opponentReady && (
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--success)]">
                <IconWifi size={12} />
                <span>상대방 준비 완료</span>
              </div>
            )}

            <div
              key={shakeKey}
              className={shakeKey > 0 ? "animate-shake" : ""}
            >
              <NumberPad
                selected={selected}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onSubmit={handleSecretSubmit}
                disabled={submitting}
              />
            </div>
          </div>
        </main>
      );
    }
  }

  if (room.status === "playing" || room.status === "finished") {
    const isFinished = room.status === "finished";

    const showSecrets = isSpectator
      ? !!(room.player1_secret || room.player2_secret)
      : isFinished && !!(mySecret || opponentSecret);

    const secretItems = (
      isSpectator
        ? [
          room.player1_secret && {
            label: "P1 숫자",
            secret: room.player1_secret,
            colorClass:
              "bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]",
          },
          room.player2_secret && {
            label: "P2 숫자",
            secret: room.player2_secret,
            colorClass:
              "bg-[var(--strike)]/10 border border-[var(--strike)]/20 text-[var(--strike)]",
          },
        ]
        : [
          mySecret && {
            label: "내 숫자",
            secret: mySecret,
            colorClass:
              "bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]",
          },
          opponentSecret && {
            label: "상대 숫자",
            secret: opponentSecret,
            colorClass:
              "bg-[var(--strike)]/10 border border-[var(--strike)]/20 text-[var(--strike)]",
          },
        ]
    ).filter(Boolean) as {
      label: string;
      secret: number[];
      colorClass: string;
    }[];

    const secretsRow = showSecrets ? (
      <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
        {secretItems.map(item => (
          <SecretDisplay key={item.label} {...item} />
        ))}
      </div>
    ) : null;

    const leftHistory = isSpectator
      ? {
        data: room.player1_history || [],
        label: "Player 1 기록",
      }
      : { data: myHistory, label: "내 기록" };
    const rightHistory = isSpectator
      ? {
        data: room.player2_history || [],
        label: "Player 2 기록",
      }
      : {
        data: opponentHistory,
        label: `Player ${opponentNum} 기록`,
      };

    const statusBadge = (() => {
      if (isFinished) {
        return {
          className:
            "border-[var(--success)]/20 bg-[var(--success)]/8 text-[var(--success)]",
          content: (
            <span className="font-bold text-sm">게임 종료</span>
          ),
        };
      }
      if (isSpectator) {
        return {
          className:
            "border-[var(--spectator-border)] bg-[var(--spectator-soft)] text-[var(--spectator)]",
          content: (
            <>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-sm font-bold">
                P{room.current_turn} 차례
              </span>
            </>
          ),
        };
      }
      if (isMyTurn) {
        return {
          className:
            "bg-[var(--strike)]/8 border-[var(--strike)]/20 text-[var(--strike)]",
          content: (
            <>
              <PlayerIcon player={playerNumber!} size={16} />
              <span className="font-bold text-sm">내 차례</span>
            </>
          ),
        };
      }
      return {
        className:
          "border-[var(--border)] text-[var(--text-muted)]",
        content: (
          <>
            <PlayerIcon player={opponentNum} size={16} />
            <span className="text-sm">상대 차례</span>
          </>
        ),
      };
    })();

    return (
      <main className="min-h-dvh flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        {!isSpectator && (
          <TurnNotificationBanner
            isMyTurn={isMyTurn}
            isPlaying={!isFinished}
          />
        )}

        <div className="w-full max-w-3xl animate-fade-in">
          <GameHeader
            title="온라인 대전"
            subtitle={`방 코드: ${roomCode}`}
            rightContent={isSpectator ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--spectator-border)] bg-[var(--spectator-soft)] text-[var(--spectator)]">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-xs font-bold">관전 중</span>
              </div>
            ) : undefined}
          >
            {isSpectator && showSecrets && (
              <div className="w-full flex items-center justify-center gap-4 flex-wrap">
                {secretItems.map(item => (
                  <SecretDisplay key={item.label} {...item} />
                ))}
              </div>
            )}
          </GameHeader>

          <div
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <TurnIndicatorPill
              room={room}
              playerNumber={playerNumber}
              isSpectator={isSpectator}
            />
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 ${statusBadge.className}`}
            >
              {statusBadge.content}
            </div>
          </div>

          {!isSpectator && secretsRow}

          {isSpectator ? (
            <div className="mt-6 flex flex-col md:flex-row gap-5">
              <div className="w-full md:flex-1">
                <GuessHistory
                  history={leftHistory.data}
                  label={leftHistory.label}
                />
              </div>
              <div className="w-full md:flex-1">
                <GuessHistory
                  history={rightHistory.data}
                  label={rightHistory.label}
                />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col md:flex-row gap-6 md:items-stretch">
              <div className="w-full md:w-[360px] md:shrink-0">
                <div
                  key={shakeKey}
                  className={
                    shakeKey > 0 ? "animate-shake" : ""
                  }
                >
                  <NumberPad
                    selected={selected}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    onSubmit={handleGuessSubmit}
                    disabled={
                      !isMyTurn || isFinished || submitting
                    }
                  />
                </div>
              </div>
              <div className="w-full md:flex-1 md:min-w-0 flex flex-col gap-5">
                <GuessHistory
                  history={leftHistory.data}
                  label={leftHistory.label}
                />
                {rightHistory.data.length > 0 && (
                  <GuessHistory
                    history={rightHistory.data}
                    label={rightHistory.label}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {isFinished && room.winner && (
          <VictoryOverlay
            winner={
              isSpectator
                ? `Player ${room.winner}`
                : room.winner === playerNumber
                  ? "나"
                  : `Player ${opponentNum}`
            }
            attempts={
              room.winner === 1
                ? room.player1_history.length
                : room.player2_history.length
            }
            answer={room.revealed_answer || []}
            mySecret={
              isSpectator ? room.player1_secret : mySecret
            }
            opponentSecret={
              isSpectator
                ? room.player2_secret
                : opponentSecret
            }
            secretLabels={
              isSpectator
                ? { my: "P1 숫자", opponent: "P2 숫자" }
                : undefined
            }
            onPlayAgain={() => router.push("/multi")}
            onHome={() => router.push("/")}
          />
        )}
      </main>
    );
  }

  return null;
}
