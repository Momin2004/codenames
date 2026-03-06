import { BoardDisplay } from "@/components/board/BoardDisplay";
import { Typography } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { toTileFromPublic } from "@/types/board"; // the mapper we made earlier
import { tileTemplate } from "@/utils/tileTemplate";
import { CardShell } from "@/components/layout/CardShell";

type GameStateProps = {
  gameId: Id<"game"> | null | undefined;
  playerId: Id<"player">;
  players: Doc<"player">[];
};

export function GameState
  ({
    gameId,
    playerId,
    players
  }: GameStateProps) {
  const board = useQuery(
    api.GameFunctions.getPublicBoard,
    gameId ? { gameId } : "skip"
  );

  useEffect(() => {
    console.log("gameId", gameId);
    console.log("board", board);
  }, [gameId, board]);

  if (!gameId) return null;

  if (board === undefined) {
    return <CardShell><Typography> Loading board…</ Typography></CardShell>
  }

  const tiles = board.map(toTileFromPublic);
  return (
    <CardShell width="fit-content">
      <BoardDisplay tiles={tiles ?? tileTemplate} />
    </CardShell>
  )
}