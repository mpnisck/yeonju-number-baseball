import {
  withSupabase,
  fetchRoom,
  resolvePlayerNumber,
} from "@/app/lib/api-utils";
import { checkGuess, isValidGuess, GuessResult } from "@/app/lib/game";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const init = withSupabase();
  if (init.error) return init.error;
  const { supabase } = init;

  const { roomCode } = await params;
  const { playerToken, guess } = await request.json();

  if (!playerToken || !guess) {
    return Response.json(
      { error: "토큰과 추측 숫자가 필요합니다." },
      { status: 400 }
    );
  }

  if (!isValidGuess(guess)) {
    return Response.json(
      { error: "유효하지 않은 숫자입니다." },
      { status: 400 }
    );
  }

  const roomResult = await fetchRoom(supabase, roomCode);
  if (roomResult.error) return roomResult.error;
  const { room } = roomResult;

  if (room.status !== "playing") {
    return Response.json(
      { error: "게임이 진행 중이 아닙니다." },
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

  if (room.current_turn !== playerNumber) {
    return Response.json({ error: "당신의 차례가 아닙니다." }, { status: 400 });
  }

  const opponentNumber = playerNumber === 1 ? 2 : 1;
  const { data: secretData, error: secretError } = await supabase
    .from("player_secrets")
    .select("secret")
    .eq("room_id", room.id)
    .eq("player_number", opponentNumber)
    .single();

  if (secretError || !secretData) {
    return Response.json(
      { error: "상대방의 숫자를 찾을 수 없습니다." },
      { status: 500 }
    );
  }

  const secret = secretData.secret as number[];
  const result = checkGuess(secret, guess);

  const guessResult: GuessResult = {
    guess: [...guess],
    strikes: result.strikes,
    balls: result.balls,
  };

  const historyField =
    playerNumber === 1 ? "player1_history" : "player2_history";
  const currentHistory = (room[historyField] as GuessResult[]) || [];
  const newHistory = [...currentHistory, guessResult];

  const updateData: Record<string, unknown> = {
    [historyField]: newHistory,
  };

  if (result.strikes === 4) {
    updateData.winner = playerNumber;
    updateData.status = "finished";
    updateData.revealed_answer = secret;
  } else {
    updateData.current_turn = opponentNumber;
  }

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update(updateData)
    .eq("id", room.id);

  if (updateError) {
    return Response.json(
      { error: "결과 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return Response.json({
    strikes: result.strikes,
    balls: result.balls,
  });
}
