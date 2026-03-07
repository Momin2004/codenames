import { TeamPanel } from "./TeamPanel";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { BoardDisplay } from "./board/BoardDisplay";
import { HintPanel } from "./panels/HintPanel";
import { tileTemplate } from "@/utils/tileTemplate";
import { formatGuessAmount, formatGuessesRemaining, GameDisplayProps, getStatusSubtext, getStatusText, getWinnerText, Role, TASK_ID, Team, TEAM_ID } from "./GameHelper";
import { GamePhase } from "../../../convex/DataTypes";
import { TileType } from "@/types/board";

export const GameDisplay = ({
  gameId,
  playerId,
  players,
  board,
  gameState,
  onEndGuessing,
}: GameDisplayProps) => {
  const tiles = board.board;

  const getPlayers = (team: Team, role: Role) =>
    players.filter((p) => p.team === TEAM_ID[team] && p.task === TASK_ID[role]);

  const blueOperatives = getPlayers("blue", "operative");
  const blueSpymasters = getPlayers("blue", "spymaster");
  const redOperatives = getPlayers("red", "operative");
  const redSpymasters = getPlayers("red", "spymaster");

  const statusText = getStatusText(gameState);
  const statusSubtext = getStatusSubtext(gameState);
  const guessesRemaining = formatGuessesRemaining(gameState.guessesRemaining);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "start",
        gap: 4,
        width: "100%",
      }}
    >
      <Box sx={{ justifySelf: "end" }}>
        <TeamPanel
          team="blue"
          operativePlayers={blueOperatives}
          spymasterPlayers={blueSpymasters}
          cardsLeft={String(gameState.remainingCards.blue)}
        />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Stack spacing={2} alignItems="center">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.92)",
                fontWeight: 700,
                letterSpacing: 0.4,
                fontSize: 35,
              }}
            >
              {statusText}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "rgba(255,255,255,0.72)",
                fontSize: 16,
              }}
            >
              {statusSubtext}
            </Typography>
          </Box>

          {gameState.hint && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`Clue: ${gameState.hint.word}`}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Amount: ${formatGuessAmount(gameState.hint.amount)}`}
              />
              <Chip label={`Guesses made: ${gameState.guessesMade}`} />
              {guessesRemaining !== null && (
                <Chip label={`Remaining: ${guessesRemaining}`} />
              )}
            </Stack>
          )}

          <BoardDisplay tiles={tiles ?? tileTemplate} team={players.find(x => x._id === playerId)?.team ?? TileType.Black} />

          {gameState.canGiveClue && <HintPanel playerId={playerId} />}

          {gameState.canEndGuessing && (
            <Button
              variant="contained"
              onClick={onEndGuessing}
              sx={{
                mt: 1,
                borderRadius: 2,
                px: 3,
              }}
            >
              End guessing
            </Button>
          )}

          {gameState.phase === GamePhase.GameOver && gameState.winnerTeam && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 700,
              }}
            >
              {getWinnerText(gameState.winnerTeam)}
            </Typography>
          )}
        </Stack>
      </Box>

      <Box sx={{ justifySelf: "start" }}>
        <TeamPanel
          team="red"
          operativePlayers={redOperatives}
          spymasterPlayers={redSpymasters}
          cardsLeft={String(gameState.remainingCards.red)}
        />
      </Box>
    </Box>
  );
};