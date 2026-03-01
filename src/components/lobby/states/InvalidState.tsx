import { CardShell } from "@/components/layout/CardShell";
import { Button, Stack, Typography } from "@mui/material";

export function InvalidState({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={1} alignItems="center">
      <Typography color="text.secondary">
        This lobby may have been deleted or the link is invalid.
      </Typography>
      <Button variant="outlined" onClick={onBack}>
        Back to main menu
      </Button>
    </Stack>
  );
}