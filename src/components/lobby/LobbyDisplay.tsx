import { Box, Button, Card, CardContent, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { createSxStyles } from "@/utils/createSxStyles";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "react-router-dom";
import type { Id } from "../../../convex/_generated/dataModel";
import { Padding } from "@mui/icons-material";

const useStyles = () =>
  createSxStyles({
    root: {

    },
    card: {
      width: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "primary.main",
      bgcolor: "rgba(30, 30, 30, 0.88)",
      backdropFilter: "blur(10px)",
      backgroundImage:
        "linear-gradient(180deg, rgba(68,161,148,0.08) 0%, rgba(83,125,150,0.04) 100%)",
      boxShadow:
        "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(68,161,148,0.08)",
    },
    cardContent: {
      p: { xs: 2.5, sm: 4 },
    },
    title: {
      color: "primary.main",
      letterSpacing: 0.4,
      textAlign: "center",
    },
    statusBody: {
      minHeight: '100%',
      display: "grid",
      placeItems: "center",
      textAlign: "center",
    },
    codeBox: {
      width: "100%",
      p: 1.5,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "rgba(68,161,148,0.30)",
      bgcolor: "rgba(255,255,255,0.02)",
    },
    playersSection: {
      width: "100%",
    },
    playerRow: {
      width: "100%",
      p: 1.5,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "rgba(255,255,255,0.08)",
      bgcolor: "rgba(255,255,255,0.02)",
    },
    actions: {
      width: "100%",
      display: "flex",
      gap: 1,
      justifyContent: "flex-end",
      flexWrap: "wrap",
    },
    button: {
      margin: 2
    }
  });

export const LobbyDisplay = () => {
  const styles = useStyles();
  const { lobbyId } = useParams();

  const renderShell = (content: React.ReactNode) => (
    <Box sx={styles.root}>
      <Card elevation={0} sx={styles.card}>
        <CardContent sx={styles.cardContent}>{content}</CardContent>
      </Card>
    </Box>
  );

  var lobby;
  try {
    lobby = useQuery(
      api.GameFunctions.getLobbyById,
      lobbyId ? { lobbyId: lobbyId as Id<"lobby"> } : "skip"
    );
  }
  catch {
    return renderShell(
      <Box sx={styles.statusBody}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight={700} sx={styles.title}>

          </Typography>
          <Typography color="text.secondary" sx={{ paddingBottom: 2 }}>
            This lobby may have been deleted or the link is invalid.
          </Typography>
          <Button variant={"outlined"} sx={styles.button}>
            Back to main menu
          </Button>
        </Stack>
      </Box>
    )
  }

  if (lobby === undefined || lobby === null) {
    return renderShell(
      <Box sx={styles.statusBody}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="h6">Loading lobby...</Typography>
        </Stack>
      </Box>
    );
  }

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return renderShell(
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700} sx={styles.title}>
        Lobby
      </Typography>

      <Box sx={styles.codeBox}>
        <Typography variant="caption" color="text.secondary">
          Lobby ID
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
          {lobbyId}
        </Typography>
      </Box>

      <Divider />

      <Stack spacing={1.5} sx={styles.playersSection}>
        <Typography variant="h6" fontWeight={700}>
          Players ({lobby.players.length})
        </Typography>

        {lobby.players.map((player, index) => (
          <Box key={`${player.name}-${index}`} sx={styles.playerRow}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography>{player.name}</Typography>
              {player.organizer && (
                <Typography variant="caption" color="primary.main" fontWeight={700}>
                  HOST
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Typography color="text.secondary">
        Waiting for players to join...
      </Typography>

      <Box sx={styles.actions}>
        <Button variant="outlined" onClick={copyInviteLink}>
          Copy Invite Link
        </Button>
        <Button variant="contained" disabled={lobby.players.length < 2}>
          Start Game
        </Button>
      </Box>
    </Stack>
  );
};