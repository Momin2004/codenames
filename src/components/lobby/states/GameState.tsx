import { BoardDisplay } from "@/components/board/BoardDisplay";
import { Box, Container, Stack, Typography } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { toTileFromPublic } from "@/types/board";
import { tileTemplate } from "@/utils/tileTemplate";
import { CardShell } from "@/components/layout/CardShell";
import { CardColor } from "@/types/CardColor";

type GameStateProps = {
  gameId: Id<"game"> | null | undefined;
  playerId: Id<"player">;
  players: Doc<"player">[];
};

type Team = "blue" | "red";
type Role = "operative" | "spymaster";

function PlayerListCard({
  title,
  players,
  color
}: {
  title: string;
  players: Doc<"player">[];
  color: CardColor
}) {
  return (
    <CardShell title={title} width="100%" color={color}>
      <Stack spacing={1}>
        {players.length === 0 ? (
          <Typography color="rgba(255,255,255,0.65)">No players yet</Typography>
        ) : (
          players.map((player) => (
            <Typography key={player._id} color="rgba(255,255,255,0.92)">
              {"name" in player ? String(player.name) : String(player.id)}
            </Typography>
          ))
        )}
      </Stack>
    </CardShell>
  );
}

function CardsLeftDisplay({
  team,
  count,
}: {
  team: Team;
  count: number | string;
}) {
  const color =
    team === "blue" ? "rgba(33, 150, 243, 0.92)" : "rgba(244, 67, 54, 0.92)";

  return (
    <Box
      sx={{
        minWidth: 88,
        px: 1,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}
      >
        Cards left
      </Typography>

      <Typography variant="h3" fontWeight={800} sx={{ color }}>
        {count}
      </Typography>
    </Box>
  );
}

function TeamPanel({
  team,
  operativePlayers,
  spymasterPlayers,
  cardsLeft,
}: {
  team: Team;
  operativePlayers: Doc<"player">[];
  spymasterPlayers: Doc<"player">[];
  cardsLeft: number | string;
}) {
  const color = team === "blue" ? CardColor.Blue : CardColor.Red;

  return (
    <Stack marginTop={5} gap={3}>
      <PlayerListCard title={`Operative`} players={operativePlayers} color={color} />

      <CardsLeftDisplay team={team} count={cardsLeft} />

      <PlayerListCard title={`Spymaster`} players={spymasterPlayers} color={color} />
    </Stack >
  );
}

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
    <Container>
      <Stack direction="row" sx={{ gap: 4 }}>
        <TeamPanel
          team="blue"
          operativePlayers={blueOperatives}
          spymasterPlayers={blueSpymasters}
          cardsLeft={blueCardsLeft}
        />

        <CardShell width="fit-content">
          <BoardDisplay tiles={tiles ?? tileTemplate} />
        </CardShell>

        <TeamPanel
          team="red"
          operativePlayers={redOperatives}
          spymasterPlayers={redSpymasters}
          cardsLeft={redCardsLeft}
        />
      </Stack>
    </Container>
  );
}