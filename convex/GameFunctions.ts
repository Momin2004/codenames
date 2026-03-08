import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { DeckTemplate } from "./DeckTemplate";
import { GamePhase, PlayableTeam, Role, Team, TurnStatus } from "./DataTypes";
import { Task } from "@mui/icons-material";

type GameDoc = Doc<"game">;
type Turn = GameDoc["turns"][number];
type BoardTile = GameDoc["board"][number];

type Flow =
  | {
    phase: GamePhase.GameOver;
    activeTeam: null;
    turnIndex: -1;
    currentTurn: null;
  }
  | {
    phase: GamePhase.Clue | GamePhase.Guess;
    activeTeam: PlayableTeam;
    turnIndex: number;
    currentTurn: Turn | null;
  };

export const createGame = mutation({
  args: {
    lobbyId: v.id("lobby"),
  },

  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) throw new Error("Lobby not found");

    let deckId: Id<"deck"> | null =
      (lobby.currentDeck as Id<"deck"> | null) ?? null;

    if (!deckId) {
      const firstDecks = await ctx.db.query("deck").take(1);

      if (firstDecks.length > 0) {
        deckId = firstDecks[0]._id;
      } else {
        if (DeckTemplate.words.length < 25) {
          throw new Error("Default deck template must contain at least 25 words");
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
    const { board, startingTeam } = createCodenamesBoard(selectedWords);

    const gameId = await ctx.db.insert("game", {
      active: true,
      startingTeam,
      winnerTeam: null,
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
    playerId: v.id("player"),
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("Lobby not found");
    if (player.task !== Role.Operative) throw new Error("Player must be operative");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.currentGame) throw new Error("Game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const flow = getFlow(game);

    if (flow.phase !== GamePhase.Guess) {
      throw new Error("A new turn cannot be started right now");
    }

    if (player.team !== flow.activeTeam) {
      throw new Error("It is not your team's clue turn");
    }

    const turn: Turn = {
      team: switchTeam(flow.activeTeam),
      guesses: [],
      status: TurnStatus.Clue,
    };

    const updatedBoard = game.board.map((tile) => {tile.selectedBy = []; return tile})
    
    await ctx.db.patch(lobby.currentGame, {
      board: updatedBoard,
      turns: [...game.turns, turn],
    });

    return { success: true };
  },
});

export const setTurnHint = mutation({
  args: {
    playerId: v.id("player"),
    word: v.string(),
    amount: v.int64(), // use -1n for infinity
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("Lobby not found");
    if (player.task !== Role.Spymaster) throw new Error("Player must be spymaster");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.currentGame) throw new Error("Game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const flow = getFlow(game);

    if (flow.phase !== GamePhase.Clue) {
      throw new Error("You can only set a clue during the clue phase");
    }

    if (player.team !== flow.activeTeam) {
      throw new Error("Player is not on the active team");
    }

    const cleanedWord = args.word.trim();
    if (!cleanedWord) {
      throw new Error("Hint word cannot be empty");
    }

    if (args.amount < -1n) {
      throw new Error("Hint amount must be -1 or greater");
    }

    const updatedTurns = [...game.turns];

    if (flow.currentTurn && flow.turnIndex >= 0) {
      if (flow.currentTurn.status !== TurnStatus.Clue) {
        throw new Error("This turn is not waiting for a clue");
      }

      updatedTurns[flow.turnIndex] = {
        ...flow.currentTurn,
        hint: {
          word: cleanedWord,
          amount: args.amount,
        },
        status: TurnStatus.Guess,
      };
    } else {
      updatedTurns.push({
        team: flow.activeTeam,
        guesses: [],
        hint: {
          word: cleanedWord,
          amount: args.amount,
        },
        status: TurnStatus.Guess,
      });
    }

    await ctx.db.patch(lobby.currentGame, {
      turns: updatedTurns,
    });

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
    if (!player.currentLobby) throw new Error("Lobby not found");
    if (player.task !== Role.Operative) throw new Error("Player must be operative");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.currentGame) throw new Error("Game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");

    const flow = getFlow(game);

    if (flow.phase !== GamePhase.Guess) {
      throw new Error("You can only guess during the guess phase");
    }

    if (!flow.currentTurn || flow.turnIndex < 0) {
      throw new Error("No active turn found");
    }

    if (player.team !== flow.activeTeam) {
      throw new Error("Player is not on the active turn team");
    }

    if (!flow.currentTurn.hint) {
      throw new Error("No clue has been set yet");
    }

    const tilePos = Number(args.tileIndex);
    if (!Number.isInteger(tilePos) || tilePos < 0 || tilePos >= game.board.length) {
      throw new Error("Tile index out of range");
    }

    const targetTile = game.board[tilePos];
    if (targetTile.isGuessed) {
      throw new Error("Tile already guessed");
    }

    const updatedBoard = [...game.board];
    updatedBoard[tilePos] = {
      ...targetTile,
      isGuessed: true,
    };

    const updatedTurns = [...game.turns];
    const updatedTurn: Turn = {
      ...flow.currentTurn,
      guesses: [
        ...flow.currentTurn.guesses,
        {
          tileIndex: args.tileIndex,
          playerId: args.playerId,
        },
      ],
    };

    const maxGuesses = getMaxGuesses(flow.currentTurn.hint.amount);
    const guessedOwnColor = targetTile.type === flow.currentTurn.team;
    const hitBlack = targetTile.type === Team.Black;
    const reachedGuessLimit = updatedTurn.guesses.length >= maxGuesses;

    updatedTurn.status =
      hitBlack || !guessedOwnColor || reachedGuessLimit
        ? TurnStatus.Finished
        : TurnStatus.Guess;

    updatedTurns[flow.turnIndex] = updatedTurn;

    const redLeft = countRemaining(updatedBoard, Team.Red);
    const blueLeft = countRemaining(updatedBoard, Team.Blue);

    let winnerTeam: PlayableTeam | null = null;

    if (hitBlack) {
      winnerTeam = switchTeam(flow.currentTurn.team);
    } else if (redLeft === 0) {
      winnerTeam = Team.Red;
    } else if (blueLeft === 0) {
      winnerTeam = Team.Blue;
    }

    await ctx.db.patch(lobby.currentGame, {
      board: updatedBoard,
      turns: updatedTurns,
      active: winnerTeam === null,
      winnerTeam,
    });

    if (!guessedOwnColor || reachedGuessLimit) {
      const turn: Turn = {
        team: switchTeam(flow.activeTeam),
        guesses: [],
        status: TurnStatus.Clue,
      };

      const updatedBoard = game.board.map((tile) => {tile.selectedBy = []; return tile})
    
      await ctx.db.patch(lobby.currentGame, {
        board: updatedBoard,
        turns: [...game.turns, turn],
      });
    }

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
    if (!player.currentLobby) throw new Error("lobby not found");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if (!lobby.currentGame) throw new Error("game not found");

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
    if (!player.currentLobby) throw new Error("Lobby not found");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.currentGame) throw new Error("Game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");

    const revealAll = player.task === Role.Spymaster || !game.active;

    return {
      board: revealAll ? game.board : maskBoard(game.board),
      cardLeft: {
        red: countRemaining(game.board, Team.Red),
        blue: countRemaining(game.board, Team.Blue),
      },
    };
  },
});

export const selectCard = mutation({
  args: {
    playerId: v.id("player"),
    tileIndex: v.int64(),
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("lobby not found");
    if (player.task === Role.Spymaster) throw new Error("player must be operative");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("lobby not found");
    if (!lobby.currentGame) throw new Error("game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");
    if (!game.active) throw new Error("Game is not active");
    
    const flow = getFlow(game)

    if (player.team !== flow.activeTeam) throw new Error("player must be in active team");

    const tilePos = Number(args.tileIndex);

    const targetTile = game.board[tilePos];
    const updatedBoard = [...game.board];

    if (targetTile.selectedBy.includes(args.playerId)) {
      updatedBoard[tilePos] = {
      ...targetTile,
      selectedBy: targetTile.selectedBy.filter(id => id !== args.playerId),
      };
    } else {
      updatedBoard[tilePos] = {
        ...targetTile,
        selectedBy: [...targetTile.selectedBy, args.playerId],
      };
    }
    await ctx.db.patch(lobby.currentGame, {
      board: updatedBoard,
    });
  }
})


export const getPublicBoard = query({
  args: {
    gameId: v.id("game"),
  },

  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const revealAll = !game.active;

    return {
      board: revealAll ? game.board : maskBoard(game.board),
      cardLeft: {
        red: countRemaining(game.board, Team.Red),
        blue: countRemaining(game.board, Team.Blue),
      },
      revealAll,
      gameActive: game.active,
      winnerTeam: game.winnerTeam,
    };
  },
});

export const getPlayerGameState = query({
  args: {
    playerId: v.id("player"),
  },

  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    if (!player.currentLobby) throw new Error("Lobby not found");

    const lobby = await ctx.db.get(player.currentLobby);
    if (!lobby) throw new Error("Lobby not found");
    if (!lobby.currentGame) throw new Error("Game not found");

    const game = await ctx.db.get(lobby.currentGame);
    if (!game) throw new Error("Game not found");

    const flow = getFlow(game);

    const hint =
      flow.phase === GamePhase.Guess && flow.currentTurn?.hint
        ? flow.currentTurn.hint
        : null;

    const guessesMade =
      flow.phase === GamePhase.Guess && flow.currentTurn
        ? flow.currentTurn.guesses.length
        : 0;

    let guessesRemaining: number | "infinite" | null = null;

    if (flow.phase === GamePhase.Guess && flow.currentTurn?.hint) {
      const maxGuesses = getMaxGuesses(flow.currentTurn.hint.amount);
      guessesRemaining =
        maxGuesses === Number.POSITIVE_INFINITY
          ? "infinite"
          : Math.max(maxGuesses - flow.currentTurn.guesses.length, 0);
    }

    const canGiveClue =
      flow.phase === GamePhase.Clue &&
      flow.activeTeam === player.team &&
      player.task === Role.Spymaster;

    const canGuess =
      flow.phase === GamePhase.Guess &&
      flow.activeTeam === player.team &&
      player.task === Role.Operative;

    const players = await ctx.db
      .query("player")
      .filter(q => q.eq(q.field("currentLobby"), player.currentLobby))
      .collect();

    const activeRoleNeeded =
      flow.phase === GamePhase.Clue ? Role.Spymaster : Role.Operative;

    const activePlayerNames =  players
      .filter(p => p.team === flow.activeTeam && p.task === activeRoleNeeded)
      .map(p => p.name);

    return {
      phase: flow.phase,
      activeTeam: flow.activeTeam,
      activeRole:
        flow.phase === GamePhase.Clue
          ? Role.Spymaster
          : flow.phase === GamePhase.Guess
            ? Role.Operative
            : null,
      myTeam: player.team,
      myRole: player.task,
      activePlayers: activePlayerNames,
      startingTeam: game.startingTeam,
      winnerTeam: game.winnerTeam,
      gameActive: game.active,
      isMyTurn: canGiveClue || canGuess,
      canGiveClue,
      canGuess,
      canEndGuessing: canGuess,
      hint,
      guessesMade,
      guessesRemaining,
      remainingCards: {
        red: countRemaining(game.board, Team.Red),
        blue: countRemaining(game.board, Team.Blue),
      },
    };
  },
});

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickRandomWords(words: string[], count: number): string[] {
  return shuffle(words).slice(0, Math.min(count, words.length));
}

function createCodenamesBoard(words: string[]): {
  board: BoardTile[];
  startingTeam: PlayableTeam;
} {
  const startingTeam: PlayableTeam =
    Math.random() < 0.5 ? Team.Red : Team.Blue;

  const redCount = startingTeam === Team.Red ? 9 : 8;
  const blueCount = startingTeam === Team.Blue ? 9 : 8;

  const types = [
    ...Array(redCount).fill(Number(Team.Red)),
    ...Array(blueCount).fill(Number(Team.Blue)),
    ...Array(7).fill(Number(Team.Neutral)),
    Number(Team.Black),
  ];

  const shuffledTypes = shuffle(types);

  return {
    startingTeam,
    board: words.map((word, index) => ({
      position: BigInt(index),
      word,
      type: BigInt(shuffledTypes[index]) as BoardTile["type"],
      isGuessed: false,
      selectedBy: []
    })),
  };
}

function maskBoard(board: BoardTile[]) {
  return board.map((tile) => ({
    position: tile.position,
    word: tile.word,
    isGuessed: tile.isGuessed,
    type: tile.isGuessed ? tile.type : null,
  }));
}

function switchTeam(team: PlayableTeam): PlayableTeam {
  return team === Team.Red ? Team.Blue : Team.Red;
}

function getFlow(game: GameDoc): Flow {
  if (!game.active) {
    return {
      phase: GamePhase.GameOver,
      activeTeam: null,
      turnIndex: -1,
      currentTurn: null,
    };
  }

  if (game.turns.length === 0) {
    return {
      phase: GamePhase.Clue,
      activeTeam: game.startingTeam,
      turnIndex: -1,
      currentTurn: null,
    };
  }

  const turnIndex = game.turns.length - 1;
  const currentTurn = game.turns[turnIndex];

  if (currentTurn.status === TurnStatus.Finished) {
    return {
      phase: GamePhase.Clue,
      activeTeam: switchTeam(currentTurn.team),
      turnIndex,
      currentTurn,
    };
  }

  return {
    phase:
      currentTurn.status === TurnStatus.Clue
        ? GamePhase.Clue
        : GamePhase.Guess,
    activeTeam: currentTurn.team,
    turnIndex,
    currentTurn,
  };
}

function getMaxGuesses(amount: bigint): number {
  if (amount < 0n) return Number.POSITIVE_INFINITY;
  return Number(amount) + 1;
}

function countRemaining(board: BoardTile[], team: PlayableTeam): number {
  return board.filter((tile) => !tile.isGuessed && tile.type === team).length;
}