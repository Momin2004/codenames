import { Typography } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { CardShell } from "@/components/layout/CardShell";
import { GameDisplay } from "@/components/game/GameDisplay";

export type GameStateProps = {
  gameId: Id<"game"> | null | undefined;
  playerId: Id<"player">;
  players: Doc<"player">[];
};

export type Team = "blue" | "red";
export type Role = "operative" | "spymaster";

export function GameState({
  gameId,
  playerId,
  players,
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
    return (
      <CardShell>
        <Typography>Loading board…</Typography>
      </CardShell>
    );
  }

  return <GameDisplay gameId={gameId} playerId={playerId} players={players} board={board} />
}