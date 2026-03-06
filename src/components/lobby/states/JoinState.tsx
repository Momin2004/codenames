import type { Id } from "../../../../convex/_generated/dataModel";
import React from "react";
import { JoinLobbyForm } from "../../home/JoinLobbyForm";
import { CardShell } from "@/components/layout/CardShell";

export function JoinState({
  lobbyId,
  setPlayerId,
}: {
  lobbyId: Id<"lobby">;
  setPlayerId: React.Dispatch<React.SetStateAction<Id<"player"> | undefined>>;
}) {
  return (
    <CardShell title="Lumo Codenames">
      <JoinLobbyForm lobbyId={lobbyId} setPlayerId={setPlayerId} />
    </CardShell>
  )
}
