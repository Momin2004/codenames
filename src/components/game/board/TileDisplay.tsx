import { Tile, TileType } from "@/types/board";
import { createSxStyles } from "@/utils/createSxStyles";
import { Box, Card, IconButton, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

interface TileDisplayProps {
  tile: Tile;
  team: TileType;
  onClick: () => void;
  onConfirmClick: () => void;
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

const useStyles = (
  tile: Tile,
  team: TileType,
  clickable: boolean,
  hasSelection: boolean
) => {
  const bg = getTileBg(tile);
  const border = getTileBorder(tile, team);

  return createSxStyles({
    root: {
      width: 160,
      height: 128,
      perspective: "1000px",
      cursor: clickable ? "pointer" : "default",
      position: "relative",
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
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      borderRadius: 3,
      bgcolor: bg,
      border: "1px solid",
      borderColor: hasSelection ? "rgba(255,255,255,0.8)" : border,
      boxShadow: tile.isGuessed
        ? "0 10px 25px rgba(0,0,0,0.25)"
        : hasSelection
          ? "0 0 0 2px rgba(255,255,255,0.18), 0 10px 20px rgba(0,0,0,0.18)"
          : "none",
      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
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
    selectedBy: {
      mt: 0.75,
      px: 1,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 1.2,
      color: "rgba(255,255,255,0.72)",
    },
    confirmButton: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 2,
      width: 28,
      height: 28,
      bgcolor: "rgba(255,255,255,0.18)",
      color: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(6px)",
      "&:hover": {
        bgcolor: "rgba(255,255,255,0.28)",
      },
    },
  });
};

export const TileDisplay = ({
  tile,
  team,
  onClick,
  onConfirmClick,
  disabled = false,
}: TileDisplayProps) => {
  const clickable = !!onClick && !disabled && !tile.isGuessed;
  const hasSelection = tile.selectedByNames != undefined;
  const showConfirmButton = tile.selectedByMe && !tile.isGuessed && !disabled;
  const styles = useStyles(tile, team, clickable, hasSelection);

  return (
    <Box sx={styles.root} onClick={clickable ? onClick : undefined}>
      {showConfirmButton && (
        <IconButton
          sx={styles.confirmButton}
          onClick={(event) => {
            event.stopPropagation();
            onConfirmClick();
          }}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={styles.flipper}>
        <Card sx={{ ...styles.face, ...styles.front }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>

          {hasSelection && (
            <Typography sx={styles.selectedBy}>
              {tile.selectedByNames.join(", ")}
            </Typography>
          )}
        </Card>

        <Card sx={{ ...styles.face, ...styles.back }}>
          <Typography sx={styles.word}>{tile.word || "—"}</Typography>

          {hasSelection && (
            <Typography sx={styles.selectedBy}>
              {tile.selectedByNames.join(", ")}
            </Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
};