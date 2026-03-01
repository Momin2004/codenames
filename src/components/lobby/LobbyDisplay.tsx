import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CardShell } from "../layout/CardShell";

import { useLobbyState } from "./useLobbyState";
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

  const { view, lobbyResult } = useLobbyState({ lobbyId, playerId });

  const startGame = useMutation(api.GameFunctions.createGame);

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const title =
    view === "join" ? "Lumo Codenames" :
      view === "game" ? "Game" :
        "Lobby";

  let body: React.ReactNode;
  switch (view) {
    case "loading":
      body = <LoadingState />;
      break;
    case "invalid":
      body = <InvalidState onBack={() => navigate("/")} />;
      break;
    case "join":
      body = <JoinState lobbyId={lobbyId} setPlayerId={setPlayerId} />;
      break;
    case "game":
      body = <GameState />;
      break;
    case "waiting":
      body = (
        <WaitingState
          lobbyId={lobbyId}
          playerId={playerId!}
          lobbyResult={lobbyResult!}
          onCopyInvite={copyInviteLink}
          onStartGame={() => startGame({ lobbyId })}
        />
      );
      break;
  }

  return <CardShell title={title}>{body}</CardShell>;
};