import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CardShell } from "../layout/CardShell";

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


  const playersResult = useQuery(api.GameFunctions.getPlayersByLobbyId, { lobbyId });
  const players: Doc<"player">[] = playersResult?.players ?? [];
  const { state: view } = useLobbyState({ lobbyId, playerId });

  const startGame = useMutation(api.GameFunctions.createGame);

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const title =
    view === LobbyState.Join ? "Lumo Codenames" :
      view === LobbyState.Game ? "Game" :
        "Lobby";

  let body: React.ReactNode;
  switch (view) {
    case LobbyState.Loading:
      body = <LoadingState />;
      break;
    case LobbyState.Invalid:
      body = <InvalidState onBack={() => navigate("/")} />;
      break;
    case LobbyState.Join:
      body = <JoinState lobbyId={lobbyId} setPlayerId={setPlayerId} />;
      break;
    case LobbyState.Game:
      body = <GameState />;
      break;
    case LobbyState.Waiting:
      body = (
        <WaitingState
          lobbyId={lobbyId}
          playerId={playerId!}
          players={players}
          onCopyInvite={copyInviteLink}
          onStartGame={() => startGame({ lobbyId })}
        />
      );
      break;
  }

  return <CardShell title={title}>{body}</CardShell>;
};