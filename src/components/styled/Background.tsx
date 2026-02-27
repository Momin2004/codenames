import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

export function Background({ children }: PropsWithChildren) {
  return (
    <Box sx={{ position: "relative", height: "100dvh", width: "100%", overflow: "hidden" }}>
      {/* Always-cover background */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(68, 161, 148, 0.18), transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(83, 125, 150, 0.16), transparent 45%),
            linear-gradient(180deg, #0f1115 0%, #121212 100%)
          `,
        }}
      />

      {/* Grid overlay */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          display: "grid",
          placeItems: "center",
          p: 2,
          boxSizing: "border-box", // <-- prevents padding from creating overflow
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 560 }}>{children}</Box>
      </Box>
    </Box>
  );
}