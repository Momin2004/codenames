import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { createSxStyles } from "@/utils/createSxStyles";

const useStyles = () =>
  createSxStyles({
    root: {
      width: "min(750px, 100%)",
      mx: "auto",
    },

    card: {
      width: "100%",
      borderRadius: 3,
      position: "relative",
      overflow: "hidden",

      bgcolor: "rgba(255,255,255,0.06)",
      border: "1px solid",
      borderColor: "rgba(255,255,255,0.14)",

      boxShadow: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      backgroundImage: "none",
    },

    cardContent: {
      p: { xs: 2.5, sm: 4 },
    },

    title: {
      color: "rgba(255,255,255,0.92)",
      letterSpacing: 0.3,
      textAlign: "center",
    },

    centeredBody: {
      minHeight: 320,
      display: "grid",
      placeItems: "center",
      textAlign: "center",
    },

    actions: {
      width: "100%",
      display: "flex",
      gap: 1,
      justifyContent: "flex-end",
      flexWrap: "wrap",
    },
  });

type FooterAlign = "left" | "center" | "right";

export type CardShellProps = {
  title?: ReactNode;
  children: ReactNode;
  centerContent?: boolean;
  minHeight?: number;
  actions?: ReactNode;
  actionsAlign?: FooterAlign;
  width?: string;
};

export function CardShell({
  title,
  children,
  centerContent = false,
  minHeight,
  actions,
  actionsAlign = "right",
  width,
}: CardShellProps) {
  const styles = useStyles();

  const justify =
    actionsAlign === "left"
      ? "flex-start"
      : actionsAlign === "center"
        ? "center"
        : "flex-end";

  return (
    <Box sx={{ ...styles.root, ...(width ? { width } : null) }}>
      <Box sx={styles.card}>
        <Box sx={styles.cardContent}>
          <Stack spacing={3} alignItems="center">
            {title ? (
              typeof title === "string" ? (
                <Typography variant="h4" fontWeight={700} sx={styles.title}>
                  {title}
                </Typography>
              ) : (
                title
              )
            ) : null}

            <Box
              sx={{
                width: "100%",
                ...(centerContent
                  ? { ...styles.centeredBody, ...(minHeight ? { minHeight } : null) }
                  : null),
              }}
            >
              {children}
            </Box>

            {actions ? (
              <Box sx={{ ...styles.actions, justifyContent: justify }}>{actions}</Box>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}