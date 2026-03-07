import { useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CardShell } from "../../layout/CardShell";

type HintCount = number | "∞";

interface HintPanelProps {
  onSubmit?: (hint: { word: string; count: HintCount }) => void;
}

const hintOptions: HintCount[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, "∞"];

export const HintPanel = ({ onSubmit }: HintPanelProps) => {
  const [word, setWord] = useState("");
  const [count, setCount] = useState<HintCount>(1);

  const handleSubmit = () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    onSubmit?.({
      word: trimmedWord,
      count,
    });

    setWord("");
    setCount(1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <CardShell width="100%" >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="stretch">
          <TextField
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
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
            onClick={handleSubmit}
            disabled={!word.trim()}
            sx={{ minWidth: 120 }}
          >
            Submit
          </Button>
        </Stack>
      </CardShell>
    </Box>
  );
};