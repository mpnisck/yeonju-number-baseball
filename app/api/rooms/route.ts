import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";
import { generateRoomCode } from "@/app/lib/room-code";

export async function POST() {
  const supabase = getSupabaseAdmin();
  const playerToken = crypto.randomUUID();

  let roomCode = generateRoomCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("game_rooms")
      .select("id")
      .eq("room_code", roomCode)
      .single();

    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const { error } = await supabase.from("game_rooms").insert({
    room_code: roomCode,
    player1_token: playerToken,
    status: "waiting",
  });

  if (error) {
    return NextResponse.json(
      { error: "방 생성에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    roomCode,
    playerToken,
    playerNumber: 1,
  });
}
