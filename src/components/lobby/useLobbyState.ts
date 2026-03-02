import { useMemo } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

export enum LobbyState {
  Invalid,
  Loading,
  Join,
  Waiting,
  Game
}

type UseLobbyStateArgs = {
  lobby?: Doc<"lobby"> | null | undefined;
  playerId?: Id<"player">;
};

export function useLobbyState({ lobby, playerId }: UseLobbyStateArgs) {
  const state: LobbyState = useMemo(() => {
    if (lobby === undefined) return LobbyState.Loading;
    if (lobby === null) return LobbyState.Invalid;
    if (!playerId) return LobbyState.Join;
    if (lobby.currentGame) return LobbyState.Game;
    return LobbyState.Waiting;
  }, [lobby, playerId]);

  return { state };
}