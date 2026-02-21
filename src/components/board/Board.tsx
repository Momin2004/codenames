import { Stack } from "@mui/material"
import { Tile } from "./Tile"

interface BoardProps {
  width: number,
  height: number
}

export const Board = ({ width, height }: BoardProps) => {
  return (
    <Stack spacing={1}>
      {Array.from({ length: height }).map((_, row) => (
        <Stack key={row} direction="row" spacing={1}>
          {Array.from({ length: width }).map((_, col) => (
            <Tile key={`${row}-${col}`} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};