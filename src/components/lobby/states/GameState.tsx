import { BoardDisplay } from "@/components/board/BoardDisplay";
import { Box, Typography } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { toTileFromPublic } from "@/types/board";
import { tileTemplate } from "@/utils/tileTemplate";
import { CardShell } from "@/components/layout/CardShell";
import { TeamPanel } from "@/components/board/TeamPanel";
import { HintPanel } from "@/components/board/HintPanel";

type GameStateProps = {
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
  const TEAM_ID: Record<Team, bigint> = { red: 1n, blue: 2n };
  const tiles = board.map(toTileFromPublic);

  const TASK_ID: Record<Role, bigint> = { operative: 1n, spymaster: 2n };

  const getPlayers = (team: Team, role: Role) =>
    players.filter((p) => p.team === TEAM_ID[team] && p.task === TASK_ID[role]);


  const blueOperatives = getPlayers("blue", "operative");
  const blueSpymasters = getPlayers("blue", "spymaster");
  const redOperatives = getPlayers("red", "operative");
  const redSpymasters = getPlayers("red", "spymaster");

  const blueCardsLeft = "—";
  const redCardsLeft = "—";

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "start",
      gap: 4,
      width: "100%",
    }}>
      <Box sx={{ justifySelf: "end" }}>
        <TeamPanel
          team="blue"
          operativePlayers={blueOperatives}
          spymasterPlayers={blueSpymasters}
          cardsLeft={blueCardsLeft}
        />
      </Box>

      <Box>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 700,
            mb: 2,
            letterSpacing: 0.4,
            fontSize: 35
          }}
        >
          Give your operatives a clue
        </Typography>
        <BoardDisplay tiles={tiles ?? tileTemplate} />
        <HintPanel />
      </Box>

      <Box sx={{ justifySelf: "start" }}>
        <TeamPanel
          team="red"
          operativePlayers={redOperatives}
          spymasterPlayers={redSpymasters}
          cardsLeft={redCardsLeft}
        />
      </Box>
    </Box >
  );
}