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
  player1_secret: number[] | null;
  player2_secret: number[] | null;
  isSpectator?: boolean;
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

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function fetchRoom(roomCode: string, token: string) {
  return fetch(`/api/rooms/${roomCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function useMultiplayerGame(roomCode: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof getSupabase>["channel"]
  > | null>(null);

  const playerTokenRef = useRef<string | null>(null);
  const isSpectatorRef = useRef(false);

  useEffect(() => {
    playerTokenRef.current = playerToken;
  }, [playerToken]);

  useEffect(() => {
    isSpectatorRef.current = isSpectator;
  }, [isSpectator]);

  const refreshRoom = useCallback(async () => {
    const token = playerTokenRef.current;
    const spectator = isSpectatorRef.current;

    if (!spectator && !token) return;

    try {
      const res = spectator
        ? await fetch(`/api/rooms/${roomCode}?spectator=true`)
        : await fetchRoom(roomCode, token!);

      if (res.ok) {
        const data = await res.json();
        setRoom(data);
      }
    } catch {}
  }, [roomCode]);

  useEffect(() => {
    const init = async () => {
      const stored = getStoredPlayer(roomCode);

      if (stored) {
        setPlayerToken(stored.token);
        setPlayerNumber(stored.playerNumber);
        playerTokenRef.current = stored.token;

        const res = await fetchRoom(roomCode, stored.token);
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
        } else {
          await tryJoin();
        }
      } else {
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
        playerTokenRef.current = data.playerToken;

        const roomRes = await fetchRoom(roomCode, data.playerToken);
        if (roomRes.ok) {
          setRoom(await roomRes.json());
        }
      } else {
        setIsSpectator(true);
        isSpectatorRef.current = true;

        const spectatorRes = await fetch(
          `/api/rooms/${roomCode}?spectator=true`
        );
        if (spectatorRes.ok) {
          const data = await spectatorRes.json();
          setRoom(data);
        } else {
          try {
            const errData = await spectatorRes.json();
            setError(errData.error || "방을 찾을 수 없습니다.");
          } catch {
            setError("서버 오류가 발생했습니다.");
          }
        }
      }
    };

    init();
  }, [roomCode]);

  useEffect(() => {
    let client: ReturnType<typeof getSupabase> | null = null;
    try {
      client = getSupabase();
    } catch {
      return;
    }

    const channel = client
      .channel(`room-${roomCode}`, {
        config: { presence: { key: "" } },
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          refreshRoom();
        }
      )
      .subscribe(async status => {
        if (status === "SUBSCRIBED" && isSpectatorRef.current) {
          await channel.track({ type: "spectator" });
        }
      });

    channelRef.current = channel;

    return () => {
      client!.removeChannel(channel);
    };
  }, [roomCode, refreshRoom]);

  useEffect(() => {
    if (isSpectator && channelRef.current) {
      channelRef.current.track({ type: "spectator" });
    }
  }, [isSpectator]);

  useEffect(() => {
    if (!playerToken && !isSpectator) return;
    if (!room) return;
    if (room.status === "finished") return;

    const interval = setInterval(() => {
      refreshRoom();
    }, 5000);

    return () => clearInterval(interval);
  }, [playerToken, isSpectator, room?.status, refreshRoom]);

  const submitSecret = useCallback(
    async (secret: number[]) => {
      if (!playerToken) return { success: false, error: "토큰이 없습니다." };

      const res = await fetch(`/api/rooms/${roomCode}/secret`, {
        method: "POST",
        headers: authHeaders(playerToken),
        body: JSON.stringify({ playerToken, secret }),
      });

      if (res.ok) {
        await refreshRoom();
        return { success: true, error: null };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    },
    [playerToken, roomCode, refreshRoom]
  );

  const submitGuess = useCallback(
    async (guess: number[]) => {
      if (!playerToken) return { success: false, error: "토큰이 없습니다." };

      const res = await fetch(`/api/rooms/${roomCode}/guess`, {
        method: "POST",
        headers: authHeaders(playerToken),
        body: JSON.stringify({ playerToken, guess }),
      });

      const data = await res.json();
      if (res.ok) {
        await refreshRoom();
        return { success: true, error: null, ...data };
      } else {
        return { success: false, error: data.error };
      }
    },
    [playerToken, roomCode, refreshRoom]
  );

  const isMyTurn = room?.current_turn === playerNumber;
  const myHistory =
    playerNumber === 1 ? room?.player1_history : room?.player2_history;
  const opponentHistory =
    playerNumber === 1 ? room?.player2_history : room?.player1_history;
  const myReady =
    playerNumber === 1 ? room?.player1_ready : room?.player2_ready;
  const opponentReady =
    playerNumber === 1 ? room?.player2_ready : room?.player1_ready;
  const mySecret =
    playerNumber === 1 ? room?.player1_secret : room?.player2_secret;
  const opponentSecret =
    playerNumber === 1 ? room?.player2_secret : room?.player1_secret;

  return {
    room,
    playerNumber,
    isLoading,
    error,
    isSpectator,
    submitSecret,
    submitGuess,
    isMyTurn,
    myHistory: myHistory || [],
    opponentHistory: opponentHistory || [],
    myReady: myReady || false,
    opponentReady: opponentReady || false,
    isWinner: room?.winner === playerNumber,
    mySecret: mySecret || null,
    opponentSecret: opponentSecret || null,
  };
}
