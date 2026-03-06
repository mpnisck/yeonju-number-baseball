import { withSupabase, fetchRoom } from "@/app/lib/api-utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const init = withSupabase();
  if (init.error) return init.error;
  const { supabase } = init;

  const { roomCode } = await params;

  const roomResult = await fetchRoom(supabase, roomCode);
  if (roomResult.error) return roomResult.error;
  const { room } = roomResult;

  if (room.player2_token) {
    return Response.json({ error: "이미 가득 찬 방입니다." }, { status: 400 });
  }

  if (room.status !== "waiting") {
    return Response.json(
      { error: "참가할 수 없는 상태입니다." },
      { status: 400 }
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
    return Response.json({ error: "방 참가에 실패했습니다." }, { status: 500 });
  }

  return Response.json({
    playerToken,
    playerNumber: 2,
  });
}
