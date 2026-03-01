import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { CardShell } from "../layout/CardShell";
import { JoinLobbyForm } from "../home/JoinLobbyForm";

type View = "invalid" | "loading" | "join" | "waiting" | "game";

export const LobbyDisplay = () => {
  const navigate = useNavigate();
  const { lobbyId: param } = useParams<{ lobbyId: string }>();
  const lobbyId = param as Id<"lobby">;

  const { state } = useLocation();
  const [playerId, setPlayerId] = useState<Id<"player"> | undefined>(() => {
    return (state as { playerId?: Id<"player"> } | null)?.playerId;
  });


  var lobbyResult;
  try {

    lobbyResult = useQuery(api.GameFunctions.getLobbyById, { lobbyId });
  }
  catch {
    lobbyResult = null;
  }

  const view: View = useMemo(() => {
    if (lobbyResult === undefined) return "loading"; // query still loading
    if (lobbyResult === null || lobbyResult?.lobby == null) return "invalid";
    if (!playerId) return "join";
    if (lobbyResult.lobby.currentGame) return "game";
    return "waiting";
  }, [lobbyResult, playerId]);

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const startGame = useMutation(api.GameFunctions.createGame);

  const title =
    view === "join" ? "Lumo Codenames" :
      view === "game" ? "Game" :
        "Lobby";

  const actions =
    view === "invalid" ? (
      <Button variant="outlined" onClick={() => navigate("/")}>Back to main menu</Button>
    ) : view === "waiting" ? (
      <>
        <Button variant="outlined" onClick={copyInviteLink}>
          Copy Invite Link
        </Button>
        <Button
          variant="contained"
          disabled={(lobbyResult?.lobby?.players?.length ?? 0) < 2}
          onClick={() => startGame({ lobbyId })}
        >
          Start Game
        </Button>
      </>
    ) : null;

  const body =
    view === "loading" ? (
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="h6">Loading lobby...</Typography>
      </Stack>
    ) : view === "invalid" ? (
      <Stack spacing={1} alignItems="center">
        <Typography color="text.secondary">
          This lobby may have been deleted or the link is invalid.
        </Typography>
      </Stack>
    ) : view === "join" ? (
      <JoinLobbyForm lobbyId={lobbyId} setPlayerId={setPlayerId} />
    ) : view === "game" ? (
      <Typography>TODO: render your Game component here</Typography>
    ) : (
      // waiting
      <Stack spacing={3}>
        <Box
          sx={{
            width: "100%",
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(68,161,148,0.30)",
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Lobby ID
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
            {lobbyId}
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            Players ({lobbyResult?.lobby?.players?.length ?? 0}) — you: {playerId}
          </Typography>

          {(lobbyResult?.lobby?.players ?? []).map((p, index) => (
            <Box
              key={`${p}-${index}`}
              sx={{
                width: "100%",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.08)",
                bgcolor: "rgba(255,255,255,0.02)",
              }}
            >
              <Typography>{p}</Typography>
            </Box>
          ))}
        </Stack>

        <Typography color="text.secondary">Waiting for players to join...</Typography>
      </Stack>
    );

  return (
    <CardShell title={title} actions={actions}>
      {body}
    </CardShell>
  );
};