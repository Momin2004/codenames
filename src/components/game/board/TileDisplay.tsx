import { Tile, TileType } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";
import { Box, Card, Typography } from "@mui/material";

interface TileDisplayProps {
  tile: Tile;
  team: TileType;
}

export function getTileBg(tile: Tile) {

  switch (tile.type) {
    case TileType.Red:
      return "rgba(244, 143, 177, 0.1)";
    case TileType.Blue:
      return "rgba(121, 134, 203, 0.1)";
    case TileType.Black:
      return "rgba(0,0,0,0.5)";
    case TileType.Neutral:
      return "rgba(255,255,255,0.10)"
    default:
      return "rgba(15, 34, 39, 0.1)";
  }
}

function getTileBorder(tile: Tile, team: TileType) {
  if (tile.type === TileType.Red && team === TileType.Red) return "rgba(244, 143, 177, 1)";
  if (tile.type === TileType.Blue && team === TileType.Blue) return "rgba(121, 134, 203, 1)";
  return "rgba(0, 0, 0, 0)"
}

const useStyles = (tile: Tile, team: TileType) => {
  const bg = getTileBg(tile);
  const border = getTileBorder(tile, team);

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

export const TileDisplay = ({ tile, team }: TileDisplayProps) => {
  const styles = useStyles(tile, team);

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