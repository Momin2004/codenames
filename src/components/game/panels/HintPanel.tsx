import { useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardShell } from "../../layout/CardShell";

type HintCount = number | "∞";

interface HintPanelProps {
  playerId: Id<"player">;
}

const hintOptions: HintCount[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, "∞"];

export const HintPanel = ({ playerId }: HintPanelProps) => {
  const [word, setWord] = useState("");
  const [count, setCount] = useState<HintCount>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setTurnHint = useMutation(api.GameFunctions.setTurnHint);

  const handleSubmit = async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await setTurnHint({
        playerId: playerId,
        word: trimmedWord,
        amount: count === "∞" ? -1n : BigInt(count),
      });

      setWord("");
      setCount(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <CardShell width="100%">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <TextField
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />

          <TextField
            select
            label="Number"
            value={count}
            onChange={(e) =>
              setCount(e.target.value === "∞" ? "∞" : Number(e.target.value))
            }
            sx={{ minWidth: 120 }}
          >
            {hintOptions.map((option) => (
              <MenuItem key={String(option)} value={option}>
                <Typography>{option}</Typography>
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={!word.trim() || isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Stack>
      </CardShell>
    </Box>
  );
};