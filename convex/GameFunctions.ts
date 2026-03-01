import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const createLobby = mutation({
  args: {
    admin: v.id("player"),
  },

  handler: async (ctx, args) => {
    const lobby = {
      players: [args.admin],
      currentGame: null,
      currentDeck: null,
    }
    const lobbyid = await ctx.db.insert("lobby", lobby);

    await ctx.db.patch(args.admin, { organizer: true, currentLobby: lobbyid });

    return { lobbyid: lobbyid }
  }
})

export const joinLobby = mutation({
  args: {
    lobbyId: v.id("lobby"),
    playerId: v.id("player"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("User not found");

    if (player.currentLobby && player.currentLobby !== args.lobbyId) {
      throw new Error("User is already in another lobby");
    }

    const players = lobby.players ?? [];

    if (!players.some((p) => p === args.playerId)) {
      await ctx.db.patch(args.lobbyId, { players: [...players, args.playerId] });
    }

    if (player.currentLobby !== args.lobbyId) {
      await ctx.db.patch(args.playerId, { currentLobby: args.lobbyId });
    }

    return { lobbyId: args.lobbyId, userId: args.playerId };
  },
});

export const getPlayersByLobbyId = query({
  args: {
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    const playerIds = lobby.players ?? [];

    const players = (
      await Promise.all(playerIds.map((id) => ctx.db.get(id)))
    ).filter((p): p is NonNullable<typeof p> => p !== null);

    return { players };
  },
});

export const addPlayer = mutation({
  args: {
    player: v.id("player"),
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    await ctx.db.patch(args.lobbyId, {
      players: [...(lobby.players ?? []), args.player],
    });

    return { lobbyId: args.lobbyId };
  },
});

export const removePlayer = mutation({
  args: {
    player: v.id("player"),
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    await ctx.db.patch(args.lobbyId, {
      players: (lobby.players ?? []).filter((p) => p !== args.player),
    });

    return { lobbyId: args.lobbyId };
  },
});

export const createPlayer = mutation({
  args: {
    username: v.string(),
  },

  handler: async (ctx, args) => {
    const player = {
      name: args.username,
      team: 0n,
      task: 0n,
      organizer: false,
      currentLobby: null,
    };

    const playerId = await ctx.db.insert("player", player);
    return { playerId: playerId };
  },
})

export const getLobbyById = query({
  args: {
    lobbyId: v.string(),
  },

  handler: async (ctx, args) => {
    const normalized = ctx.db.normalizeId("lobby", args.lobbyId);
    if (!normalized) return { lobby: null };

    const lobby = await ctx.db.get(normalized);
    return { lobby };
  },
});

export const selectDeck = mutation({
  args: {
    deckId: v.id("deck"),
    lobbyId: v.id("lobby")
  },

  handler: async (ctx, args) => {

    await ctx.db.patch(args.lobbyId, { currentDeck: args.deckId });

    return { succes: true }
  }

})

export const createGame = mutation({
  args: {
    lobbyId: v.id("lobby")
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    if (!lobby.currentDeck) throw new Error("no deck found");
    const deck = await ctx.db.get(lobby.currentDeck)
    if (!deck) throw new Error("Deck not found");

    if (deck.words.length < 25) {
      throw new Error("Deck must contain at least 25 words");
    }

    const selectedWords = pickRandomWords(deck.words, 25);
    const board = createCodenamesBoard(selectedWords);

    const game = {
      active: true,
      turns: [],
      players: lobby.players,
      board,
    };

    const gameId = await ctx.db.insert("game", game);

    await ctx.db.patch(args.lobbyId, { currentGame: gameId });


    return { gameId: gameId };
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
  }))
}

