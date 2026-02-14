"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/app/lib/supabase";
import { GuessResult } from "@/app/lib/game";

export interface GameRoom {
  id: string;
  room_code: string;
  player1_ready: boolean;
  player2_ready: boolean;
  status: "waiting" | "setup" | "playing" | "finished";
  current_turn: number;
  winner: number | null;
  player1_history: GuessResult[];
  player2_history: GuessResult[];
  revealed_answer: number[] | null;
}

interface PlayerInfo {
  token: string;
  playerNumber: 1 | 2;
}

function getStoredPlayer(roomCode: string): PlayerInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`numbaseball_${roomCode}`);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function storePlayer(roomCode: string, info: PlayerInfo) {
  localStorage.setItem(`numbaseball_${roomCode}`, JSON.stringify(info));
}

export function useMultiplayerGame(roomCode: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>["channel"]> | null>(null);

  // 초기 로드: 토큰 확인 + 방 상태 가져오기
  useEffect(() => {
    const init = async () => {
      const stored = getStoredPlayer(roomCode);

      if (stored) {
        // 기존 플레이어: 방 상태 가져오기
        setPlayerToken(stored.token);
        setPlayerNumber(stored.playerNumber);

        const res = await fetch(
          `/api/rooms/${roomCode}?token=${stored.token}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
        } else {
          // 토큰이 유효하지 않으면 참가 시도
          await tryJoin();
        }
      } else {
        // 새 플레이어: 참가 시도
        await tryJoin();
      }

      setIsLoading(false);
    };

    const tryJoin = async () => {
      const res = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        const info: PlayerInfo = {
          token: data.playerToken,
          playerNumber: data.playerNumber,
        };
        storePlayer(roomCode, info);
        setPlayerToken(data.playerToken);
        setPlayerNumber(data.playerNumber);

        // 방 상태 다시 가져오기
        const roomRes = await fetch(
          `/api/rooms/${roomCode}?token=${data.playerToken}`,
        );
        if (roomRes.ok) {
          setRoom(await roomRes.json());
        }
      } else {
        const errData = await res.json();
        setError(errData.error || "방 참가에 실패했습니다.");
      }
    };

    init();
  }, [roomCode]);

  // Realtime 구독
  useEffect(() => {
    const client = getSupabase();
    const channel = client
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const newRoom = payload.new as GameRoom;
          setRoom(newRoom);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      client.removeChannel(channel);
    };
  }, [roomCode]);

  // 비밀 숫자 제출
  const submitSecret = useCallback(
    async (secret: number[]) => {
      if (!playerToken) return { success: false, error: "토큰이 없습니다." };

      const res = await fetch(`/api/rooms/${roomCode}/secret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerToken, secret }),
      });

      if (res.ok) {
        return { success: true, error: null };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    },
    [playerToken, roomCode],
  );

  // 추측 제출
  const submitGuess = useCallback(
    async (guess: number[]) => {
      if (!playerToken) return { success: false, error: "토큰이 없습니다." };

      const res = await fetch(`/api/rooms/${roomCode}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerToken, guess }),
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, error: null, ...data };
      } else {
        return { success: false, error: data.error };
      }
    },
    [playerToken, roomCode],
  );

  // 파생 상태
  const isMyTurn = room?.current_turn === playerNumber;
  const myHistory =
    playerNumber === 1 ? room?.player1_history : room?.player2_history;
  const opponentHistory =
    playerNumber === 1 ? room?.player2_history : room?.player1_history;
  const myReady =
    playerNumber === 1 ? room?.player1_ready : room?.player2_ready;
  const opponentReady =
    playerNumber === 1 ? room?.player2_ready : room?.player1_ready;
  const isWinner = room?.winner === playerNumber;

  return {
    room,
    playerNumber,
    isLoading,
    error,
    submitSecret,
    submitGuess,
    isMyTurn,
    myHistory: myHistory || [],
    opponentHistory: opponentHistory || [],
    myReady: myReady || false,
    opponentReady: opponentReady || false,
    isWinner,
  };
}
