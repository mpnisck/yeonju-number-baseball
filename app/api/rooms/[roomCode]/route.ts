import {
  withSupabase,
  fetchRoom,
  extractToken,
  resolvePlayerNumber,
} from "@/app/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const init = withSupabase();
  if (init.error) return init.error;
  const { supabase } = init;

  const { roomCode } = await params;
  const token = extractToken(request);
  const url = new URL(request.url);
  const isSpectator = url.searchParams.get("spectator") === "true";

  if (!token && !isSpectator) {
    return Response.json({ error: "토큰이 필요합니다." }, { status: 400 });
  }

  const roomResult = await fetchRoom(supabase, roomCode);
  if (roomResult.error) return roomResult.error;
  const { room } = roomResult;

  if (isSpectator) {
    const { player1_token, player2_token, id, ...safeRoom } = room;

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

    return Response.json({
      ...safeRoom,
      isSpectator: true,
      player1_secret,
      player2_secret,
    });
  }

  const playerNumber = resolvePlayerNumber(room, token!);

  if (!playerNumber) {
    return Response.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 403 }
    );
  }

  const { player1_token, player2_token, ...safeRoom } = room;

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

  return Response.json({
    ...safeRoom,
    playerNumber,
    player1_secret,
    player2_secret,
  });
}
