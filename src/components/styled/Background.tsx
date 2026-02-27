import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

export function Background({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: `
          radial-gradient(circle at 20% 20%, rgba(68, 161, 148, 0.18), transparent 40%),
          radial-gradient(circle at 80% 30%, rgba(83, 125, 150, 0.16), transparent 45%),
          linear-gradient(180deg, #0f1115 0%, #121212 100%)
        `,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560 }}>
        {children}
      </Box>
    </Box>
  );
}