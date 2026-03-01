import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export function WaitingState({
  lobbyId,
  playerId,
  players,
  onCopyInvite,
  onStartGame,
}: {
  lobbyId: Id<"lobby">;
  playerId: Id<"player">;
  players: Doc<"player">[];
  onCopyInvite: () => void;
  onStartGame: () => void;
}) {
  return (
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
          Players ({players.length})
        </Typography>

        {players.map((p) => (
          <Box
            key={p._id}
            sx={{
              width: "100%",
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(255,255,255,0.08)",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography>
                {p.name}
                {p._id === playerId ? " (you)" : ""}
              </Typography>

              {p.organizer ? (
                <Typography variant="caption" color="primary.main" fontWeight={700}>
                  HOST
                </Typography>
              ) : null}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Typography color="text.secondary">Waiting for players to join...</Typography>

      <Box sx={{ width: "100%", display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={onCopyInvite}>
          Copy Invite Link
        </Button>
        <Button variant="contained" disabled={players.length < 2} onClick={onStartGame}>
          Start Game
        </Button>
      </Box>
    </Stack>
  );
}