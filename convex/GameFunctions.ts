import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

export const startNewTurn = mutation({
  args: {
    playerId: v.id("player")
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("lobby not found");
    if (player.task !== 2n) throw new Error("player needs to be spion") 

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if  (!lobby.currentGame) throw new Error("game not found");
    
    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const currentTurn = (game.turns.length % 2) + 1

    const turn = {
      team: BigInt(currentTurn),
      guesses: [],
    };

    await ctx.db.patch(lobby.currentGame, { turns: [...game.turns, turn] });
    return { success: true };
  },
});

export const setTurnHint = mutation({
  args: {
    playerId: v.id("player"),
    word: v.string(),
    amount: v.int64(),
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("lobby not found");
    if (player.task !== 2n) throw new Error("player needs to be spion") 

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if  (!lobby.currentGame) throw new Error("game not found");
    
    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");
    if (player.team !== game.turns[game.turns.length - 1].team) {
      throw new Error("Player is not on the active turn team");
    }

    const updatedTurns = [...game.turns];
    const lastTurnIndex = updatedTurns.length - 1;
    
    if (game.turns[lastTurnIndex].hint) throw new Error("already hint in turn")
    
    updatedTurns[lastTurnIndex] = {
      ...updatedTurns[lastTurnIndex],
      hint: { word: args.word, amount: args.amount },
    };

    await ctx.db.patch(lobby.currentGame, { turns: updatedTurns });
    return { success: true };
  },
});

export const makeMove = mutation({
  args: {
    playerId: v.id("player"),
    tileIndex: v.int64(),
  },

  handler: async (ctx, args) => {

    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("lobby not found");
    if (player.task !== 1n) throw new Error("player needs to be spion") 

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if  (!lobby.currentGame) throw new Error("game not found");
    
    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

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

    if (turnPos < 0) throw new Error("no active turn")

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

    await ctx.db.patch(lobby.currentGame, {
      board: updatedBoard,
      turns: updatedTurns,
    });

    //if (game.turns[turnPos].guesses.length >= (game.turns[turnPos].hint?.amount ?? 0)) 

    return { success: true };
  },
});

export const getPlayerState = query({
  args: {
    playerId: v.id("player"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if  (!player.currentLobby) throw new Error("lobby not found");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if  (!lobby.currentGame) throw new Error("game not found");
    
    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const currentTurn = game.turns.length - 1;

    if (player.team !== game.turns[currentTurn].team) return [0, player]
    if (player.task === 2n && game.turns[currentTurn].hint) return [0, player]
    if (player.task === 1n && !game.turns[currentTurn].hint) return [0, player]
    return [1, player]
  }
})

export const getBoard = query({
  args: {
    playerId: v.id("player"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if  (!player.currentLobby) throw new Error("lobby not found");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if  (!lobby.currentGame) throw new Error("game not found");
    
    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const redLeft = game.board.filter((tile) => !tile.isGuessed && tile.type === 1n);

    const blueLeft = game.board.filter((tile) => !tile.isGuessed && tile.type === 2n);

    if (player.task === 2n) {
      return {board: game.board, cardLeft: [blueLeft.length, redLeft.length]};
    } else {
      return {board: game.board.map((t) => ({
        position: t.position,
        word: t.word,
        isGuessed: t.isGuessed,
        type: t.isGuessed ? t.type : null,
      })), cardLeft: [blueLeft.length, redLeft.length]};
    }
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
    ...Array(6).fill(0), // neutral
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
