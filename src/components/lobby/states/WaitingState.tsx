import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Team = 0 | 1 | 2;
type Role = 0 | 1 | 2;

function toTeam(p: Doc<"player">): Team {
  return Number((p as any).team ?? 0) as Team;
}

function toRole(p: Doc<"player">): Role {
  return Number((p as any).role ?? (p as any).task ?? 0) as Role;
}

function teamLabel(t: Team) {
  if (t === 1) return "Blue";
  if (t === 2) return "Red";
  return "None";
}

function roleLabel(r: Role) {
  if (r === 2) return "Spymaster";
  if (r === 1) return "Operatives";
  return "None";
}

function teamColor(t: Team) {
  return t === 1 ? "info" : t === 2 ? "error" : "default";
}

function SlotCard({
  title,
  subtitle,
  team,
  role,
  meId,
  playersInSlot,
  isSingleSlot,
  playerId,
  lobbyId,
  onJoin,
  onLeave,
}: {
  title: string;
  subtitle: string;
  team: Team;
  role: Role;
  meId: Id<"player">;
  playersInSlot: Doc<"player">[];
  isSingleSlot: boolean;
  playerId: Id<"player">;
  lobbyId: Id<"lobby">
  onJoin: (playerId: Id<"player">, team: Team, role: Role, lobbyId: Id<"lobby">) => void;
  onLeave: () => void;
}) {
  const occupiedByOther =
    isSingleSlot &&
    playersInSlot.length > 0 &&
    playersInSlot[0]!._id !== meId;

  const iAmInThisSlot = playersInSlot.some((p) => p._id === meId);

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "rgba(255,255,255,0.10)",
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.25}>
            <Typography fontWeight={800}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={`${teamLabel(team)} • ${roleLabel(role)}`}
            color={teamColor(team) as any}
            variant="outlined"
          />
        </Stack>

        <Divider sx={{ opacity: 0.2 }} />

        {playersInSlot.length === 0 ? (
          <Typography color="text.secondary">Empty</Typography>
        ) : (
          <Stack spacing={0.75}>
            {playersInSlot.map((p) => (
              <Stack
                key={p._id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>
                  {p.name}
                  {p._id === meId ? " (you)" : ""}
                </Typography>

                {(p as any).organizer ? (
                  <Typography variant="caption" color="primary.main" fontWeight={800}>
                    HOST
                  </Typography>
                ) : null}
              </Stack>
            ))}
          </Stack>
        )}

        <Stack direction="row" gap={1} justifyContent="flex-end" flexWrap="wrap">
          {iAmInThisSlot ? (
            <Button variant="outlined" onClick={onLeave}>
              Leave
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={occupiedByOther}
              onClick={() => onJoin(playerId, team, role, lobbyId)}
            >
              {occupiedByOther ? "Taken" : "Join"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export function WaitingState({
  lobbyId,
  playerId,
  players,
  onCopyInvite,
  onStartGame,
  onPickSlot,
  onClearSlot,
}: {
  lobbyId: Id<"lobby">;
  playerId: Id<"player">;
  players: Doc<"player">[];

  onCopyInvite: () => void;
  onStartGame: () => void;

  onPickSlot: (team: Team, role: Role) => void;
  onClearSlot: () => void;
}) {
  const blueSpymaster = players.filter((p) => toTeam(p) === 1 && toRole(p) === 2);
  const blueOperatives = players.filter((p) => toTeam(p) === 1 && toRole(p) === 1);

  const redSpymaster = players.filter((p) => toTeam(p) === 2 && toRole(p) === 2);
  const redOperatives = players.filter((p) => toTeam(p) === 2 && toRole(p) === 1);

  const unassigned = players.filter((p) => toTeam(p) === 0 || toRole(p) === 0);
  const changePlayerRole = useMutation(api.GameFunctions.changePlayerRole);

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

      <Stack spacing={1}>
        <Typography variant="h6" fontWeight={800}>
          Pick your team & role
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Each team has 1 spymaster and any number of operatives.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          width: "100%",
        }}
      >
        <SlotCard
          title="Blue Spymaster"
          subtitle="Gives clues to Blue operatives"
          team={1}
          role={2}
          meId={playerId}
          playersInSlot={blueSpymaster}
          isSingleSlot
          onJoin={(playerId, team, role, lobbyId) =>
            changePlayerRole({ playerId, lobbyId, team: BigInt(team), task: BigInt(role) })}
          onLeave={onClearSlot}
          lobbyId={lobbyId}
          playerId={playerId}
        />

        <SlotCard
          title="Red Spymaster"
          subtitle="Gives clues to Red operatives"
          team={2}
          role={2}
          meId={playerId}
          playersInSlot={redSpymaster}
          isSingleSlot
          onJoin={(playerId, team, role, lobbyId) =>
            changePlayerRole({ playerId, lobbyId, team: BigInt(team), task: BigInt(role) })}
          onLeave={onClearSlot}
          lobbyId={lobbyId}
          playerId={playerId}
        />

        <SlotCard
          title="Blue Operatives"
          subtitle="Guess words based on clues"
          team={1}
          role={1}
          meId={playerId}
          playersInSlot={blueOperatives}
          isSingleSlot={false}
          onJoin={(playerId, team, role, lobbyId) =>
            changePlayerRole({ playerId, lobbyId, team: BigInt(team), task: BigInt(role) })}
          onLeave={onClearSlot}
          lobbyId={lobbyId}
          playerId={playerId}
        />

        <SlotCard
          title="Red Operatives"
          subtitle="Guess words based on clues"
          team={2}
          role={1}
          meId={playerId}
          playersInSlot={redOperatives}
          isSingleSlot={false}
          onJoin={(playerId, team, role, lobbyId) =>
            changePlayerRole({ playerId, lobbyId, team: BigInt(team), task: BigInt(role) })}
          onLeave={onClearSlot}
          lobbyId={lobbyId}
          playerId={playerId}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.10)",
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <Stack spacing={1}>
          <Typography fontWeight={800}>Unassigned ({unassigned.length})</Typography>
          {unassigned.length === 0 ? (
            <Typography color="text.secondary">Everyone picked a slot.</Typography>
          ) : (
            <Stack spacing={0.75}>
              {unassigned.map((p) => (
                <Typography key={p._id} color="text.secondary">
                  {p.name}
                  {p._id === playerId ? " (you)" : ""}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Typography color="text.secondary">Waiting for host to start the game…</Typography>

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