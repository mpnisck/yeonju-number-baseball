import {
  withSupabase,
  fetchRoom,
  resolvePlayerNumber,
} from "@/app/lib/api-utils";
import { isValidGuess } from "@/app/lib/game";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const init = withSupabase();
  if (init.error) return init.error;
  const { supabase } = init;

  const { roomCode } = await params;
  const { playerToken, secret } = await request.json();

  if (!playerToken || !secret) {
    return Response.json(
      { error: "토큰과 비밀 숫자가 필요합니다." },
      { status: 400 }
    );
  }

  if (!isValidGuess(secret)) {
    return Response.json(
      { error: "유효하지 않은 숫자입니다. 0~9 중 중복 없이 4개를 선택하세요." },
      { status: 400 }
    );
  }

  const roomResult = await fetchRoom(supabase, roomCode);
  if (roomResult.error) return roomResult.error;
  const { room } = roomResult;

  if (room.status !== "setup") {
    return Response.json(
      { error: "숫자를 설정할 수 없는 상태입니다." },
      { status: 400 }
    );
  }

  const playerNumber = resolvePlayerNumber(room, playerToken);

  if (!playerNumber) {
    return Response.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("player_secrets")
    .select("id")
    .eq("room_id", room.id)
    .eq("player_number", playerNumber)
    .single();

  if (existing) {
    return Response.json(
      { error: "이미 숫자를 설정했습니다." },
      { status: 400 }
    );
  }

  const { error: secretError } = await supabase.from("player_secrets").insert({
    room_id: room.id,
    player_number: playerNumber,
    secret,
  });

  if (secretError) {
    return Response.json(
      { error: "숫자 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  const readyField = playerNumber === 1 ? "player1_ready" : "player2_ready";
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
    return Response.json(
      { error: "상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
