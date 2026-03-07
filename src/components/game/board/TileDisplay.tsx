import { Tile, TileType } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";
import { Box, Card, Typography } from "@mui/material";

interface TileDisplayProps {
  tile: Tile;
  team: TileType;
  onClick?: () => void;
  disabled?: boolean;
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
      return "rgba(255,255,255,0.10)";
    default:
      return "rgba(15, 34, 39, 0.1)";
  }
}

function getTileBorder(tile: Tile, team: TileType) {
  if (tile.type === TileType.Red && team === TileType.Red) return "rgba(244, 143, 177, 1)";
  if (tile.type === TileType.Blue && team === TileType.Blue) return "rgba(121, 134, 203, 1)";
  return "rgba(0, 0, 0, 0)";
}

const useStyles = (tile: Tile, team: TileType, clickable: boolean) => {
  const bg = getTileBg(tile);
  const border = getTileBorder(tile, team);

  return createSxStyles({
    root: {
      width: 160,
      height: 128,
      perspective: "1000px",
      cursor: clickable ? "pointer" : "default",
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
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
      "&:hover": clickable
        ? {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
        }
        : undefined,
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
      color: "rgba(255,255,255,0.92)",
    },
  });
};

export const TileDisplay = ({ tile, team, onClick, disabled = false }: TileDisplayProps) => {
  const clickable = !!onClick && !disabled && !tile.isGuessed;
  const styles = useStyles(tile, team, clickable);

  return (
    <Box sx={styles.root} onClick={clickable ? onClick : undefined}>
      <Box sx={styles.flipper}>
        <Card sx={{ ...styles.face, ...styles.front }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>
        </Card>

        <Card sx={{ ...styles.face, ...styles.back }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>
        </Card>
      </Box>
    </Box>
  );
};