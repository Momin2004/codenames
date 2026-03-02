import { Tile, TileType } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";
import { Box, Card, Typography } from "@mui/material";

interface TileDisplayProps {
  tile: Tile;
}

function getTileBg(tile: Tile) {
  // Not guessed => always neutral (public board shouldn't leak)
  if (!tile.isGuessed) return "rgba(255,255,255,0.08)";

  // Guessed => reveal actual type color
  switch (tile.type) {
    case TileType.Red:
      return "rgba(244, 67, 54, 0.55)";
    case TileType.Blue:
      return "rgba(33, 150, 243, 0.55)";
    case TileType.Black:
      return "rgba(0,0,0,0.65)";
    case TileType.Neutral:
    default:
      return "rgba(255,255,255,0.18)";
  }
}

function getTileBorder(tile: Tile) {
  if (!tile.isGuessed) return "rgba(255,255,255,0.18)";

  switch (tile.type) {
    case TileType.Red:
      return "rgba(244, 67, 54, 0.85)";
    case TileType.Blue:
      return "rgba(33, 150, 243, 0.85)";
    case TileType.Black:
      return "rgba(0,0,0,0.9)";
    default:
      return "rgba(255,255,255,0.35)";
  }
}

const useStyles = (tile: Tile) => {
  const bg = getTileBg(tile);
  const border = getTileBorder(tile);

  return createSxStyles({
    root: {
      width: 160,
      height: 128,
      perspective: "1000px",
    },
    flipper: {
      position: "relative",
      width: "100%",
      height: "100%",
      // keep your flip if you like it; remove these 2 lines to disable flipping entirely
      transform: tile.isGuessed ? "rotateY(180deg)" : "rotateY(0deg)",
      transition: "transform 0.6s",
      transformStyle: "preserve-3d",
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

      bgcolor: bg,
      border: "1px solid",
      borderColor: border,
      boxShadow: tile.isGuessed ? "0 10px 25px rgba(0,0,0,0.25)" : "none",
    },
    front: {},
    back: {
      transform: "rotateY(180deg)",
    },
    word: {
      px: 1.5,
      textAlign: "center",
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      userSelect: "none",
      color: tile.isGuessed && tile.type === TileType.Black ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.92)",
    },
  });
};

export const TileDisplay = ({ tile }: TileDisplayProps) => {
  const styles = useStyles(tile);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.flipper}>
        <Card sx={{ ...styles.face, ...styles.front }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>
        </Card>

        {/* Word also visible on the back (so flipping doesn’t hide it) */}
        <Card sx={{ ...styles.face, ...styles.back }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>
        </Card>
      </Box>
    </Box>
  );
};