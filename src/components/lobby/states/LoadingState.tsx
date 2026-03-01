import { CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState() {
  return (
    <Stack spacing={2} alignItems="center">
      <CircularProgress size={28} />
      <Typography variant="h6">Loading lobby...</Typography>
    </Stack>
  );
}