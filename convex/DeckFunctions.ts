import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const selectDeck = mutation({
  args: {
    deckId: v.id("deck"),
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.lobbyId, { currentDeck: args.deckId });

    return { succes: true };
  },
});

export const createDeck = mutation({
  args: {
    words: v.array(v.string()),
    description: v.string(),
  },

  handler: async (ctx, args) => {
    const deck = {
      words: args.words,
      description: args.description,
    };

    const deckId = await ctx.db.insert("deck", deck);
    return { deckId };
  },
});

export const editDeck = mutation({
  args: {
    deckId: v.id("deck"),
    words: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    const patch: { words?: string[]; description?: string } = {};
    if (args.words !== undefined) patch.words = args.words;
    if (args.description !== undefined) patch.description = args.description;

    if (Object.keys(patch).length === 0) {
      throw new Error("No fields provided to update");
    }

    await ctx.db.patch(args.deckId, patch);
    return { success: true };
  },
});

export const listDecks = query({
  handler: async (ctx) => {
    const decks = await ctx.db.query("deck").collect();
    return { decks };
  },
});
