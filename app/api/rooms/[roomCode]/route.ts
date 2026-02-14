import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> },
) {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "서버 설정 오류가 발생했습니다." },
      { status: 500 },
    );
  }
  const { roomCode } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "토큰이 필요합니다." },
      { status: 400 },
    );
  }

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();

  if (error || !room) {
    return NextResponse.json(
      { error: "방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  let playerNumber: number | null = null;
  if (room.player1_token === token) playerNumber = 1;
  else if (room.player2_token === token) playerNumber = 2;

  if (!playerNumber) {
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 403 },
    );
  }

  const { player1_token, player2_token, ...safeRoom } = room;

  // 게임 종료 시 양쪽 비밀 숫자 반환
  let player1_secret: number[] | null = null;
  let player2_secret: number[] | null = null;

  if (room.status === "finished") {
    const { data: secrets } = await supabase
      .from("player_secrets")
      .select("player_number, secret")
      .eq("room_id", room.id);

    if (secrets) {
      for (const s of secrets) {
        if (s.player_number === 1) player1_secret = s.secret as number[];
        if (s.player_number === 2) player2_secret = s.secret as number[];
      }
    }
  }

  return NextResponse.json({
    ...safeRoom,
    playerNumber,
    player1_secret,
    player2_secret,
  });
}
