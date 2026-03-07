import { Box, Typography } from "@mui/material";
import { Team } from "../../lobby/states/GameState";

export function CardsLeftDisplay({
  team,
  count,
}: {
  team: Team;
  count: number | string;
}) {
  const color =
    team === "blue" ? "rgba(121, 134, 203, 0.92)" : "rgba(244, 143, 177, 0.92)";

  return (
    <Box
      sx={{
        minWidth: 88,
        px: 1,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}
      >
        Cards left
      </Typography>

      <Typography variant="h3" fontWeight={800} sx={{ color }}>
        {7}
      </Typography>
    </Box>
  );
}