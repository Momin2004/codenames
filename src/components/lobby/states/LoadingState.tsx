import { CircularProgress, Stack, Typography } from "@mui/material";
import { CardShell } from "@/components/layout/CardShell";

export function LoadingState() {
  return (
    <CardShell>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="h6">Loading lobby...</Typography>
      </Stack>
    </CardShell>
  );
}