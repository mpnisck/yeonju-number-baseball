import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";
import { isValidGuess } from "@/app/lib/game";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> },
) {
  const supabase = getSupabaseAdmin();
  const { roomCode } = await params;
  const { playerToken, secret } = await request.json();

  if (!playerToken || !secret) {
    return NextResponse.json(
      { error: "토큰과 비밀 숫자가 필요합니다." },
      { status: 400 },
    );
  }

  if (!isValidGuess(secret)) {
    return NextResponse.json(
      { error: "유효하지 않은 숫자입니다. 0~9 중 중복 없이 4개를 선택하세요." },
      { status: 400 },
    );
  }

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

  if (room.status !== "setup") {
    return NextResponse.json(
      { error: "숫자를 설정할 수 없는 상태입니다." },
      { status: 400 },
    );
  }

  let playerNumber: number | null = null;
  if (room.player1_token === playerToken) playerNumber = 1;
  else if (room.player2_token === playerToken) playerNumber = 2;

  if (!playerNumber) {
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 403 },
    );
  }

  const { data: existing } = await supabase
    .from("player_secrets")
    .select("id")
    .eq("room_id", room.id)
    .eq("player_number", playerNumber)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "이미 숫자를 설정했습니다." },
      { status: 400 },
    );
  }

  const { error: secretError } = await supabase
    .from("player_secrets")
    .insert({
      room_id: room.id,
      player_number: playerNumber,
      secret,
    });

  if (secretError) {
    return NextResponse.json(
      { error: "숫자 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  const readyField =
    playerNumber === 1 ? "player1_ready" : "player2_ready";
  const opponentReadyField =
    playerNumber === 1 ? "player2_ready" : "player1_ready";
  const opponentReady = room[opponentReadyField];

  const updateData: Record<string, unknown> = { [readyField]: true };

  if (opponentReady) {
    updateData.status = "playing";
    updateData.current_turn = 1;
  }

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update(updateData)
    .eq("id", room.id);

  if (updateError) {
    return NextResponse.json(
      { error: "상태 업데이트에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
