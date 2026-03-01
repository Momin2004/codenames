import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export type LobbyState = "invalid" | "loading" | "join" | "waiting" | "game";

type UseLobbyStateArgs = {
  lobbyId: Id<"lobby">;
  playerId?: Id<"player">;
};

export function useLobbyState({ lobbyId, playerId }: UseLobbyStateArgs) {
  const lobbyResult = useQuery(api.GameFunctions.getLobbyById, { lobbyId });

  const view: LobbyState = useMemo(() => {
    if (lobbyResult === undefined) return "loading";
    if (lobbyResult === null || lobbyResult?.lobby == null) return "invalid";
    if (!playerId) return "join";
    if (lobbyResult.lobby.currentGame) return "game";
    return "waiting";
  }, [lobbyResult, playerId]);

  return { view, lobbyResult };
}