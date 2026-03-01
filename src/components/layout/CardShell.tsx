import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
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
      border: "1px solid",
      borderColor: "primary.main",
      bgcolor: "rgba(30, 30, 30, 0.88)",
      backdropFilter: "blur(10px)",
      backgroundImage:
        "linear-gradient(180deg, rgba(68,161,148,0.08) 0%, rgba(83,125,150,0.04) 100%)",
      boxShadow:
        "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(68,161,148,0.08)",
    },

    cardContent: {
      p: { xs: 2.5, sm: 4 },
    },

    title: {
      color: "primary.main",
      letterSpacing: 0.4,
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
      <Card elevation={0} sx={styles.card}>
        <CardContent sx={styles.cardContent}>
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
        </CardContent>
      </Card>
    </Box>
  );
}