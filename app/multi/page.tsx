"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import GameHeader from "@/app/components/GameHeader";
import { IconUsers, IconLink, IconChevronRight } from "@/app/components/Icons";

export default function MultiLobbyPage() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(
          `numbaseball_${data.roomCode}`,
          JSON.stringify({
            token: data.playerToken,
            playerNumber: data.playerNumber,
          }),
        );
        router.push(`/multi/${data.roomCode}`);
      } else {
        setError(data.error || "방 생성에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  }, [router]);

  const handleJoin = useCallback(() => {
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length < 4) {
      setError("방 코드를 입력해주세요.");
      return;
    }
    setIsJoining(true);
    router.push(`/multi/${code}`);
  }, [roomCodeInput, router]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 sm:py-16">
      <div className="w-full max-w-sm flex flex-col gap-10 animate-fade-in">
        <GameHeader
          title="온라인 대전"
          subtitle="친구와 링크로 대결하세요"
        />

        {/* Create room */}
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full flex items-center justify-between px-5 py-5 rounded-2xl bg-[var(--text-primary)] text-white font-bold text-base transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <IconUsers size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold">방 만들기</div>
              <div className="text-xs font-normal opacity-70 mt-0.5">
                새로운 게임 방을 생성합니다
              </div>
            </div>
          </div>
          <IconChevronRight
            size={20}
            className={isCreating ? "animate-pulse" : ""}
          />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">
            또는
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Join room */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[var(--text-muted)] px-1">
            <IconLink size={14} />
            <span className="text-xs font-medium">방 코드로 참가</span>
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => {
                setRoomCodeInput(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="방 코드 입력"
              maxLength={6}
              className="flex-1 px-4 py-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm font-mono tracking-widest focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
            <button
              onClick={handleJoin}
              disabled={isJoining || roomCodeInput.trim().length < 4}
              className="px-6 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] font-semibold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              참가
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3.5 rounded-xl bg-[var(--danger)]/5 border border-[var(--danger)]/15 text-[var(--danger)] text-sm text-center animate-fade-in">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
