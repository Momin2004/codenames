import { Id } from "./_generated/dataModel";

export enum TurnStatus {
  Clue = "clue",
  Guess = "guess",
  Finished = "finished",
}

export enum GamePhase {
  Clue = "clue",
  Guess = "guess",
  GameOver = "gameOver",
}

export const Team = {
  Neutral: 0n,
  Red: 1n,
  Blue: 2n,
  Black: 3n,
} as const;

export const Role = {
  Spectator: 0n,
  Operative: 1n,
  Spymaster: 2n,
} as const;

export type PlayableTeam = typeof Team.Red | typeof Team.Blue;

export type PlayerTeam =
  | typeof Team.Neutral
  | typeof Team.Red
  | typeof Team.Blue;

export type PlayerRole =
  | typeof Role.Spectator
  | typeof Role.Operative
  | typeof Role.Spymaster;

export type Guess = {
  tileIndex: bigint;
  playerId: Id<"player">;
};

export type Hint = {
  word: string;
  amount: bigint;
};