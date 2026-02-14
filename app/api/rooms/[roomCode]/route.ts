import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> },
) {
  const supabase = getSupabaseAdmin();
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

  return NextResponse.json({
    ...safeRoom,
    playerNumber,
  });
}
