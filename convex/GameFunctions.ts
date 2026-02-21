import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const getMostRecentActiveGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await ctx.db
      .query("game")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .first();

    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      game: game ?? null,
    };
  },
});

export const createGame = mutation({
  args: {
    deckId: v.id("deck"),
    player: v.array(
      v.object({
        name: v.string(),
        team: v.int64(),
        task: v.int64(),
      })
    ),
  },

  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    if (deck.words.length < 25) {
      throw new Error("Deck must contain at least 25 words");
    }

    const selectedWords = pickRandomWords(deck.words, 25);
    const board = createCodenamesBoard(selectedWords);

    const game = {
      active: true,
      turns: [],
      players: args.player,
      board,
    };

    const gameId = await ctx.db.insert("game", game);

    return { gameId };
  },
});

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomWords(words: string[], count: number = 25): string[] {
  return shuffle(words).slice(0, Math.min(count, words.length));
}

function createCodenamesBoard(words: string[]) {
  // 0 = neutral, 1 = red, 2 = blue, 3 = black
  const types = [
    ...Array(9).fill(1), // red
    ...Array(8).fill(2), // blue
    ...Array(7).fill(0), // neutral
    3,                   // black
  ];

  const shuffledTypes = shuffle(types);

  return words.map((word, index) => ({
    position: BigInt(index),
    word,
    type: BigInt(shuffledTypes[index]),
    isGuessed: false,
  }));
}
