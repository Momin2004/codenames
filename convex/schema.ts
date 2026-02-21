import { defineSchema, defineTable } from "convex/server";
import { v, VArray } from "convex/values";


export default defineSchema({
  game: defineTable(
    v.object({
      active: v.boolean(),
      board: v.array(
        v.object({
          position: v.int64(),
          word: v.string(),
          type: v.int64(),
          isGuessed: v.boolean(),
        })
      ),
      turns: v.array(
        v.object({
          index: v.int64(),
          hint: v.optional(
            v.object({ amount: v.int64(), word: v.string() })
          ),
          guesses: v.array(
            v.object({ tileIndex: v.int64(), playerId: v.id("player") })
          ),
          team: v.int64(),
        })
      ),
      players: v.array(
        v.object({
          name: v.string(),
          team: v.int64(),
          task: v.int64(),
        })
      ),
    })
  ),
  deck: defineTable(
    v.object({
      words: v.array(v.string()),
      description: v.string(),
    })
  ),
  lobby: defineTable(
    v.object({
      players: v.array(
        v.object({
          name: v.string(),
          team: v.int64(),
          task: v.int64(),
          organizer: v.boolean(),
        })
      ),
      currentGame: v.union(v.id("game"), v.null()),
      currentDeck: v.union(v.id("deck"), v.null()),
    })
  ),
});
