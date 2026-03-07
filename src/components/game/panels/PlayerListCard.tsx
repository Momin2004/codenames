import { Stack, Typography } from "@mui/material";
import { CardShell } from "../../layout/CardShell";
import { Doc } from "../../../../convex/_generated/dataModel";
import { CardColor } from "@/types/CardColor";

export function PlayerListCard({
  title,
  players,
  color
}: {
  title: string;
  players: Doc<"player">[];
  color: CardColor
}) {
  return (
    <CardShell title={title} width="100%" color={color}>
      <Stack spacing={1}>
        {players.length === 0 ? (
          <Typography color="rgba(255,255,255,0.65)"></Typography>
        ) : (
          players.map((player) => (
            <Typography key={player._id} color="rgba(255,255,255,0.92)">
              {"name" in player ? String(player.name) : String(player)}
            </Typography>
          ))
        )}
      </Stack>
    </CardShell>
  );
}