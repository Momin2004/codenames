import { Avatar, Stack, Typography } from "@mui/material";
import { CardShell } from "../../layout/CardShell";
import { Doc } from "../../../../convex/_generated/dataModel";
import { CardColor } from "@/types/CardColor";

export function PlayerListCard({
  title,
  players,
  color,
}: {
  title: string;
  players: Doc<"player">[];
  color: CardColor;
}) {
  return (
    <CardShell width="250px" color={color}>
      <Stack spacing={1}>
        <Typography
          color="rgba(255,255,255,0.92)"
          fontSize={24}
          fontWeight={600}
          textAlign="center"
        >
          {title}
        </Typography>

        {players.length === 0 ? (
          <Typography color="rgba(255,255,255,0.65)">
            No players yet
          </Typography>
        ) : (
          players.map((player) => {
            const name = "name" in player ? String(player.name) : String(player);
            const initial = name.charAt(0).toUpperCase();

            return (
              <Stack
                key={player._id}
                direction="row"
                alignItems="center"
                spacing={1.5}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    bgcolor: "rgba(255, 255, 255, 0.14)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  {initial}
                </Avatar>

                <Typography color="rgba(255,255,255,0.92)">
                  {name}
                </Typography>
              </Stack>
            );
          })
        )}
      </Stack>
    </CardShell>
  );
}