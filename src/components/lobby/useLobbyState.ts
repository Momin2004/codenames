import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export enum LobbyState {
  Invalid,
  Loading,
  Join,
  Waiting,
  Game
}

type UseLobbyStateArgs = {
  lobbyId: Id<"lobby">;
  playerId?: Id<"player">;
};

export function useLobbyState({ lobbyId, playerId }: UseLobbyStateArgs) {
  const lobbyResult = useQuery(api.GameFunctions.getLobbyById, { lobbyId });

  const state: LobbyState = useMemo(() => {
    if (lobbyResult === undefined) return LobbyState.Loading;
    if (lobbyResult === null || lobbyResult?.lobby == null) return LobbyState.Invalid;
    if (!playerId) return LobbyState.Join;
    if (lobbyResult.lobby.currentGame) return LobbyState.Game;
    return LobbyState.Waiting;
  }, [lobbyResult, playerId]);

  return { state };
}