import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Role, Team, TurnStatus } from "./DataTypes";

const playableTeamValidator = v.union(
  v.literal(Team.Red),
  v.literal(Team.Blue),
);

const playerTeamValidator = v.union(
  v.literal(Team.Neutral),
  v.literal(Team.Red),
  v.literal(Team.Blue),
);

const roleValidator = v.union(
  v.literal(Role.Spectator),
  v.literal(Role.Operative),
  v.literal(Role.Spymaster),
);

const boardTileTypeValidator = v.union(
  v.literal(Team.Neutral),
  v.literal(Team.Red),
  v.literal(Team.Blue),
  v.literal(Team.Black),
);

const hintValidator = v.object({
  word: v.string(),
  amount: v.int64(),
});

const guessValidator = v.object({
  tileIndex: v.int64(),
  playerId: v.id("player"),
});

const turnValidator = v.object({
  team: playableTeamValidator,
  guesses: v.array(guessValidator),
  hint: v.optional(hintValidator),
  status: v.union(
    v.literal(TurnStatus.Clue),
    v.literal(TurnStatus.Guess),
    v.literal(TurnStatus.Finished),
  ),
});

export default defineSchema({
  game: defineTable(
    v.object({
      active: v.boolean(),
      startingTeam: playableTeamValidator,
      winnerTeam: v.union(playableTeamValidator, v.null()),
      board: v.array(
        v.object({
          position: v.int64(),
          word: v.string(),
          type: boardTileTypeValidator,
          isGuessed: v.boolean(),
          selectedBy: v.array(v.id("player"))
        }),
      ),
      turns: v.array(turnValidator),
      players: v.array(v.id("player")),
    }),
  ),

  player: defineTable(
    v.object({
      name: v.string(),
      team: playerTeamValidator,
      task: roleValidator,
      organizer: v.boolean(),
      currentLobby: v.union(v.id("lobby"), v.null()),
    }),
  ),

  deck: defineTable(
    v.object({
      words: v.array(v.string()),
      description: v.string(),
    }),
  ),

  lobby: defineTable(
    v.object({
      players: v.array(v.id("player")),
      currentGame: v.union(v.id("game"), v.null()),
      currentDeck: v.union(v.id("deck"), v.null()),
    }),
  ),
});