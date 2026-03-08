import { Tile } from "@/types/board";
import { Doc, Id } from "../../../convex/_generated/dataModel";

// export type PublicBoardTile = {
//   position: bigint;
//   word: string;
//   isGuessed: boolean;
//   type: 0n | 1n | 2n | 3n | null;
// };

export type BoardResponse = {
  board: Tile[];
  cardLeft: {
    red: number;
    blue: number;
  };
  revealAll?: boolean;
  gameActive?: boolean;
  winnerTeam?: 1n | 2n | null;
};

export type GameStateResponse = {
  phase: "clue" | "guess" | "gameOver";
  activeTeam: 1n | 2n | null;
  activeRole: 1n | 2n | null;
  activePlayers: string[];
  myTeam: 0n | 1n | 2n;
  myRole: 0n | 1n | 2n;
  startingTeam: 1n | 2n;
  winnerTeam: 1n | 2n | null;
  gameActive: boolean;
  isMyTurn: boolean;
  canGiveClue: boolean;
  canGuess: boolean;
  canEndGuessing: boolean;
  hint: {
    word: string;
    amount: bigint;
  } | null;
  guessesMade: number;
  guessesRemaining: number | "infinite" | null;
  remainingCards: {
    red: number;
    blue: number;
  };
};

export type GameDisplayProps = {
  playerId: Id<"player">;
  players: Doc<"player">[];
  board: BoardResponse;
  gameState: GameStateResponse;
};

export type Team = "blue" | "red";
export type Role = "operative" | "spymaster";

export const TEAM_ID: Record<Team, bigint> = { red: 1n, blue: 2n };
export const TASK_ID: Record<Role, bigint> = { operative: 1n, spymaster: 2n };

export function getTeamLabel(team: 1n | 2n | null) {
  if (team === 1n) return "Red";
  if (team === 2n) return "Blue";
  return "";
}

export function getWinnerText(winnerTeam: 1n | 2n | null) {
  if (winnerTeam === 1n) return "Red team wins";
  if (winnerTeam === 2n) return "Blue team wins";
  return "Game over";
}

export function formatGuessAmount(amount: bigint) {
  return amount < 0n ? "∞" : amount.toString();
}

export function formatGuessesRemaining(remaining: number | "infinite" | null) {
  if (remaining === null) return null;
  if (remaining === "infinite") return "∞";
  return remaining.toString();
}
function formatActivePlayers(names: string[]) {
  if (names.length === 0) return "Players";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function getStatusText(gameState: GameStateResponse) {
  if (gameState.phase === "gameOver") {
    return getWinnerText(gameState.winnerTeam);
  }

  const activePlayersLabel = formatActivePlayers(gameState.activePlayers);

  if (gameState.canGiveClue) {
    return "Give your operatives a clue";
  }

  if (gameState.canGuess) {
    return "Tap on cards you think match the clue";
  }

  if (gameState.phase === "clue") {
    return gameState.activePlayers.length === 1
      ? `${activePlayersLabel} is giving a clue`
      : `${activePlayersLabel} are giving a clue`;
  }

  return gameState.activePlayers.length === 1
    ? `${activePlayersLabel} is guessing`
    : `${activePlayersLabel} are guessing`;
}

export function getStatusSubtext(gameState: GameStateResponse) {
  if (gameState.phase === "gameOver") {
    return gameState.winnerTeam
      ? `All turns are finished. ${getWinnerText(gameState.winnerTeam)}.`
      : "All turns are finished.";
  }

  if (gameState.canGiveClue) {
    return "Choose one word and a number for your team.";
  }

  if (gameState.canGuess) {
    if (!gameState.hint) return "Wait for the clue to appear.";
    return `Current clue: ${gameState.hint.word} (${formatGuessAmount(gameState.hint.amount)})`;
  }

  if (gameState.phase === "clue") {
    return "Wait for the clue before making a move.";
  }

  if (!gameState.hint) {
    return "The active team is guessing.";
  }

  return `Current clue: ${gameState.hint.word} (${formatGuessAmount(gameState.hint.amount)})`;
}