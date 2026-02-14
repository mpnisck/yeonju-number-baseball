import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";

export async function POST(
  _request: NextRequest,
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

  const { data: room, error: fetchError } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();

  if (fetchError || !room) {
    return NextResponse.json(
      { error: "방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (room.player2_token) {
    return NextResponse.json(
      { error: "이미 가득 찬 방입니다." },
      { status: 400 },
    );
  }

  if (room.status !== "waiting") {
    return NextResponse.json(
      { error: "참가할 수 없는 상태입니다." },
      { status: 400 },
    );
  }

  const playerToken = crypto.randomUUID();

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({
      player2_token: playerToken,
      status: "setup",
    })
    .eq("id", room.id);

  if (updateError) {
    return NextResponse.json(
      { error: "방 참가에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    playerToken,
    playerNumber: 2,
  });
}
