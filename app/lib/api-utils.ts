import { getSupabaseAdmin } from "@/app/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin 클라이언트를 안전하게 초기화합니다.
 * 실패 시 에러 응답을 반환합니다.
 */
export function withSupabase():
  | { supabase: SupabaseClient; error?: never }
  | { supabase?: never; error: Response } {
  try {
    return { supabase: getSupabaseAdmin() };
  } catch {
    return {
      error: Response.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      ),
    };
  }
}

/**
 * room 데이터에서 playerToken으로 playerNumber를 결정합니다.
 */
export function resolvePlayerNumber(
  room: { player1_token: string; player2_token: string | null },
  token: string
): 1 | 2 | null {
  if (room.player1_token === token) return 1;
  if (room.player2_token === token) return 2;
  return null;
}

/**
 * roomCode로 방을 조회합니다.
 */
export async function fetchRoom(supabase: SupabaseClient, roomCode: string) {
  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();

  if (error || !room) {
    return {
      room: null,
      error: Response.json(
        { error: "방을 찾을 수 없습니다." },
        { status: 404 }
      ),
    };
  }

  return { room, error: null };
}

/**
 * 요청에서 playerToken을 추출합니다 (헤더 우선, 쿼리 파라미터 폴백).
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const url = new URL(request.url);
  return url.searchParams.get("token");
}
