import type { Id } from "../../../../convex/_generated/dataModel";
import React from "react";
import { JoinLobbyForm } from "../../home/JoinLobbyForm";

export function JoinState({
  lobbyId,
  setPlayerId,
}: {
  lobbyId: Id<"lobby">;
  setPlayerId: React.Dispatch<React.SetStateAction<Id<"player"> | undefined>>;
}) {
  return <JoinLobbyForm lobbyId={lobbyId} setPlayerId={setPlayerId} />;
}