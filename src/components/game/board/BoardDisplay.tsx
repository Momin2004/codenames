import { Box } from "@mui/material";
import { TileDisplay } from "./TileDisplay";
import { Tile } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";

interface BoardDisplayProps {
  tiles: Tile[];
}

const useStyles = (columns: number) =>
  createSxStyles({
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 1,
      width: "fit-content",
    },
  });

export const BoardDisplay = ({ tiles }: BoardDisplayProps) => {
  const tileCount = tiles.length;
  const columns = Math.ceil(Math.sqrt(tileCount));
  const styles = useStyles(columns);

  return (
    <Box sx={styles.grid}>
      {tiles.map((tile) => (
        <TileDisplay key={tile.position.toString()} tile={tile} />
      ))}
    </Box>
  );
};