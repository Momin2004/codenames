import { useState } from "react";
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
      return tile.isGuessed
        ? "rgba(244, 143, 177, 0.35)"
        : "rgba(244, 143, 177, 0.16)";
    case TileType.Blue:
      return tile.isGuessed
        ? "rgba(121, 134, 203, 0.35)"
        : "rgba(121, 134, 203, 0.16)";
    case TileType.Black:
      return tile.isGuessed
        ? "rgba(0,0,0,0.35)"
        : "rgba(0,0,0,0.5)";
    case TileType.Neutral:
      return tile.isGuessed
        ? "rgba(255,255,255,0.35)"
        : "rgba(255,255,255,0.10)";
    default:
      return "rgba(15, 34, 39, 0.1)";
  }
}

function getOwnTeamBorder(tile: Tile, team: TileType) {
  if (tile.type === TileType.Red && team === TileType.Red) {
    return "rgba(244, 143, 177, 1)";
  }

  if (tile.type === TileType.Blue && team === TileType.Blue) {
    return "rgba(121, 134, 203, 1)";
  }

  return "rgba(0, 0, 0, 0)";
}

const useStyles = (
  tile: Tile,
  team: TileType,
  canSelect: boolean,
  hasSelection: boolean,
  revealTurnedWord: boolean,
) => {
  const bg = getTileBg(tile);
  const ownTeamBorder = getOwnTeamBorder(tile, team);

  const rotation = tile.isGuessed
    ? "rotateY(180deg)"
    : hasSelection
      ? "rotateY(35deg)"
      : "rotateY(0deg)";

  return createSxStyles({
    root: {
      width: 160,
      height: 128,
      perspective: "1000px",
      cursor: tile.isGuessed || canSelect ? "pointer" : "default",
      position: "relative",
    },
    flipper: {
      position: "relative",
      width: "100%",
      height: "100%",
      transform: rotation,
      transition: "transform 0.45s ease",
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
      overflow: "hidden",
      borderRadius: 3,
      bgcolor: bg,
      border: "1px solid",
      borderColor: ownTeamBorder,
      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.2s ease",
    },
    front: {
      boxShadow:
        hasSelection && !tile.isGuessed
          ? "0 10px 20px rgba(0,0,0,0.18)"
          : "none",
      "&:hover": canSelect
        ? {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
        }
        : undefined,
    },
    back: {
      transform: "rotateY(180deg)",
      boxShadow: tile.isGuessed ? "0 10px 25px rgba(0,0,0,0.25)" : "none",
    },
    word: {
      px: 1.5,
      textAlign: "center",
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      userSelect: "none",
      color: "rgba(255,255,255,0.92)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    },
    turnedWord: {
      px: 1.5,
      textAlign: "center",
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      userSelect: "none",
      color: "rgba(255,255,255,0.88)",
      opacity: revealTurnedWord ? 1 : 0,
      transition: "opacity 0.15s ease",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    },
    hintText: {
      mt: 0.75,
      fontSize: 11,
      lineHeight: 1.2,
      color: "rgba(255,255,255,0.65)",
      textAlign: "center",
      px: 1,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
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
  const [revealTurnedWord, setRevealTurnedWord] = useState(false);

  const hasSelection = tile.selectedByNames.length > 0;
  const showConfirmButton = tile.selectedByMe && !tile.isGuessed && !disabled;
  const canSelect = !disabled && !tile.isGuessed;

  const styles = useStyles(
    tile,
    team,
    canSelect,
    hasSelection,
    revealTurnedWord,
  );

  const handleRootClick = () => {
    if (tile.isGuessed) {
      setRevealTurnedWord((prev) => !prev);
      return;
    }

    if (canSelect) {
      onClick();
    }
  };

  return (
    <Box sx={styles.root} onClick={handleRootClick}>
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
          {!tile.isGuessed && (
            <Typography sx={styles.word}>{tile.word || "—"}</Typography>
          )}

          {hasSelection && !tile.isGuessed && (
            <Typography sx={styles.selectedBy}>
              {tile.selectedByNames.join(", ")}
            </Typography>
          )}
        </Card>

        <Card sx={{ ...styles.face, ...styles.back }}>
          {tile.isGuessed ? (
            <>
              <Typography sx={styles.turnedWord}>
                {tile.word || "—"}
              </Typography>

              {!revealTurnedWord && (
                <Typography sx={styles.hintText}>
                  Tap to reveal
                </Typography>
              )}
            </>
          ) : (
            hasSelection && (
              <Typography sx={styles.selectedBy}>
                {tile.selectedByNames.join(", ")}
              </Typography>
            )
          )}
        </Card>
      </Box>
    </Box>
  );
};