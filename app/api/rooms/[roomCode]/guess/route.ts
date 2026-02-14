import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase-server";
import { checkGuess, isValidGuess, GuessResult } from "@/app/lib/game";

export async function POST(
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
  const { playerToken, guess } = await request.json();

  if (!playerToken || !guess) {
    return NextResponse.json(
      { error: "토큰과 추측 숫자가 필요합니다." },
      { status: 400 },
    );
  }

  if (!isValidGuess(guess)) {
    return NextResponse.json(
      { error: "유효하지 않은 숫자입니다." },
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

  if (room.status !== "playing") {
    return NextResponse.json(
      { error: "게임이 진행 중이 아닙니다." },
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

  if (room.current_turn !== playerNumber) {
    return NextResponse.json(
      { error: "당신의 차례가 아닙니다." },
      { status: 400 },
    );
  }

  const opponentNumber = playerNumber === 1 ? 2 : 1;
  const { data: secretData, error: secretError } = await supabase
    .from("player_secrets")
    .select("secret")
    .eq("room_id", room.id)
    .eq("player_number", opponentNumber)
    .single();

  if (secretError || !secretData) {
    return NextResponse.json(
      { error: "상대방의 숫자를 찾을 수 없습니다." },
      { status: 500 },
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
    return NextResponse.json(
      { error: "결과 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    strikes: result.strikes,
    balls: result.balls,
  });
}
