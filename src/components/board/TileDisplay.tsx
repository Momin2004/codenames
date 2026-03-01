import { Tile } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";
import { Box, Card, Typography } from "@mui/material";

interface TileDisplayProps {
  tile: Tile;
}

const useStyles = (tile: Tile) =>
  createSxStyles({
    root: {
      width: 160,
      height: 128,
      perspective: "1000px",

    },
    flipper: {
      position: "relative",
      width: "100%",
      height: "100%",
      transform: tile.flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      transition: "transform 0.6s",
      transformStyle: "preserve-3d"
    },
    face: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      borderRadius: 3,
    },
    front: {

    },
    back: {
      transform: "rotateY(180deg)",
    },
  });

export const TileDisplay = ({ tile }: TileDisplayProps) => {
  const styles = useStyles(tile);
  console.log(tile)
  return (
    <Box sx={styles.root}>
      <Box sx={styles.flipper}>
        <Card sx={{ ...styles.face, ...styles.front }}>
          <Typography>Front</Typography>
        </Card>

        <Card sx={{ ...styles.face, ...styles.back }}>
          <Typography>Back</Typography>
        </Card>
      </Box>
    </Box>
  );
};