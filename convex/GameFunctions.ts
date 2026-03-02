import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { DeckTemplate } from "./DeckTemplate";
import { Id } from "./_generated/dataModel";

export const createGame = mutation({
  args: {
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    let deckId: Id<"deck"> | null = (lobby.currentDeck as Id<"deck"> | null) ?? null;

    if (!deckId) {
      const firstDecks = await ctx.db.query("deck").take(1);
      if (firstDecks.length > 0) {
        deckId = firstDecks[0]._id;
      } else {
        if (DeckTemplate.words.length < 25) {
          throw new Error("Default deckTemplate must contain at least 25 words");
        }

        deckId = await ctx.db.insert("deck", DeckTemplate);
      }

      await ctx.db.patch(args.lobbyId, { currentDeck: deckId });
    }

    const deck = await ctx.db.get(deckId);
    if (!deck) throw new Error("Deck not found");

    if (deck.words.length < 25) {
      throw new Error("Deck must contain at least 25 words");
    }

    const selectedWords = pickRandomWords(deck.words, 25);
    const board = createCodenamesBoard(selectedWords);

    const gameId = await ctx.db.insert("game", {
      active: true,
      turns: [],
      players: lobby.players,
      board,
    });

    await ctx.db.patch(args.lobbyId, { currentGame: gameId });

    return { gameId };
  },
});

export const startTurn = mutation({
  args: {
    gameId: v.id("game"),
    team: v.int64(),
  },

  handler: async (ctx, args) => {
    if (args.team !== 1n && args.team !== 2n) {
      throw new Error("Invalid team");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const turn = {
      index: BigInt(game.turns.length),
      team: args.team,
      guesses: [],
    };

    await ctx.db.patch(args.gameId, { turns: [...game.turns, turn] });
    return { success: true, turnIndex: turn.index };
  },
});

export const setTurnHint = mutation({
  args: {
    gameId: v.id("game"),
    turnIndex: v.int64(),
    word: v.string(),
    amount: v.int64(),
  },

  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const turnPos = Number(args.turnIndex);
    if (turnPos < 0 || turnPos >= game.turns.length) {
      throw new Error("Turn not found");
    }

    const updatedTurns = [...game.turns];
    updatedTurns[turnPos] = {
      ...updatedTurns[turnPos],
      hint: { word: args.word, amount: args.amount },
    };

    await ctx.db.patch(args.gameId, { turns: updatedTurns });
    return { success: true };
  },
});

export const makeMove = mutation({
  args: {
    gameId: v.id("game"),
    playerId: v.id("player"),
    tileIndex: v.int64(),
  },

  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    if (!game.players.some((id) => id === args.playerId)) {
      throw new Error("Player is not part of this game");
    }

    const tilePos = Number(args.tileIndex);
    if (tilePos < 0 || tilePos >= game.board.length) {
      throw new Error("Tile index out of range");
    }

    const targetTile = game.board[tilePos];
    if (targetTile.isGuessed) {
      throw new Error("Tile already guessed");
    }

    const updatedBoard = [...game.board];
    updatedBoard[tilePos] = { ...targetTile, isGuessed: true };

    const updatedTurns = [...game.turns];
    let turnPos = updatedTurns.length - 1;

    if (turnPos < 0) {
      if (player.team !== 1n && player.team !== 2n) {
        throw new Error("Player team must be red or blue");
      }
      updatedTurns.push({
        index: 0n,
        team: player.team,
        guesses: [],
      });
      turnPos = 0;
    }

    const activeTurn = updatedTurns[turnPos];
    if (player.team !== activeTurn.team) {
      throw new Error("Player is not on the active turn team");
    }

    updatedTurns[turnPos] = {
      ...activeTurn,
      guesses: [
        ...activeTurn.guesses,
        { tileIndex: args.tileIndex, playerId: args.playerId },
      ],
    };

    await ctx.db.patch(args.gameId, {
      board: updatedBoard,
      turns: updatedTurns,
    });

    return { success: true };
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
    3, // black
  ];

  const shuffledTypes = shuffle(types);

  return words.map((word, index) => ({
    position: BigInt(index),
    word,
    type: BigInt(shuffledTypes[index]),
    isGuessed: false,
  }));
}

