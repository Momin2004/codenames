import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LobbyState, useLobbyState } from "./useLobbyState";
import { LoadingState } from "./states/LoadingState";
import { InvalidState } from "./states/InvalidState";
import { JoinState } from "./states/JoinState";
import { WaitingState } from "./states/WaitingState";
import { GameState } from "./states/GameState";

export const LobbyDisplay = () => {
  const navigate = useNavigate();
  const { lobbyId: param } = useParams<{ lobbyId: string }>();
  const lobbyId = param as Id<"lobby">;

  const { state } = useLocation();
  const [playerId, setPlayerId] = useState<Id<"player"> | undefined>(() => {
    return (state as { playerId?: Id<"player"> } | null)?.playerId;
  });

  const playersResult = useQuery(api.LobbyFunctions.getPlayersByLobbyId, { lobbyId });
  const lobby = useQuery(api.LobbyFunctions.getLobbyById, { lobbyId })
  const { state: lobbyState } = useLobbyState({ lobby: lobby?.lobby, playerId });
  const players: Doc<"player">[] = playersResult?.players ?? [];

  const startGame = useMutation(api.GameFunctions.createGame);

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  console.log("lobby: " + lobby?.lobby?.currentGame)
  switch (lobbyState) {
    case LobbyState.Loading:
      return <LoadingState />;
    case LobbyState.Invalid:
      return <InvalidState onBack={() => navigate("/")} />;
    case LobbyState.Join:
      return <JoinState lobbyId={lobbyId} setPlayerId={setPlayerId} />;
    case LobbyState.Game:
      return (
        <GameState
          gameId={lobby?.lobby?.currentGame}
          playerId={playerId!}
          players={players}
        />
      );
    case LobbyState.Waiting:
      return (
        <WaitingState
          lobbyId={lobbyId}
          playerId={playerId!}
          players={players}
          onCopyInvite={copyInviteLink}
          onStartGame={() => startGame({ lobbyId })}
        />
      );
  }
};