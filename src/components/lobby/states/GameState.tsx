import { BoardDisplay } from "@/components/board/BoardDisplay";
import { Typography } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useMemo } from "react";
import { toTileFromPublic } from "@/types/board"; // the mapper we made earlier
import { tileTemplate } from "@/utils/tileTemplate";

type GameStateProps = {
  gameId: Id<"game"> | null | undefined;
};

export function GameState({ gameId }: GameStateProps) {
  // Always call useQuery; skip when no gameId
  const board = useQuery(
    api.GameFunctions.getPublicBoard, // use public board
    gameId ? { gameId } : "skip"
  );

  useEffect(() => {
    console.log("gameId", gameId);
    console.log("board", board);
  }, [gameId, board]);

  if (!gameId) return null;

  if (board === undefined) {
    return <Typography>Loading board…</Typography>;
  }

  const tiles = board.map(toTileFromPublic); // converts bigint|null type -> TileType
  return <BoardDisplay tiles={tiles ?? tileTemplate} />;
}