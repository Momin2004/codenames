import { createSxStyles } from "@/utils/createSxStyles";
import { toTileFromPublic } from "@/types/board";
import { TeamPanel } from "./TeamPanel";
import { Box, Typography } from "@mui/material";
import { BoardDisplay } from "./board/BoardDisplay";
import { HintPanel } from "./panels/HintPanel";
import { tileTemplate } from "@/utils/tileTemplate";
import { Doc, Id } from "../../../convex/_generated/dataModel";

export type GameDisplayProps = {
  gameId: Id<"game"> | null | undefined;
  playerId: Id<"player">;
  players: Doc<"player">[];
  board: {
    board: {
      position: bigint;
      word: string;
      isGuessed: boolean;
      type: 0n | 1n | 2n | 3n | null;
    }[];
    cardLeft: {
      red: number;
      blue: number;
    };
  }
};

export type Team = "blue" | "red";
export type Role = "operative" | "spymaster";

const useStyles = (columns: number) =>
  createSxStyles({
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 1,
      width: "fit-content",
    },
  });

export const GameDisplay = ({
  gameId,
  playerId,
  players,
  board
}: GameDisplayProps) => {
  const TEAM_ID: Record<Team, bigint> = { red: 1n, blue: 2n };
  const tiles = board.board.map(toTileFromPublic);

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
};