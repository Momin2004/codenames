import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";

export function Background({ children }: PropsWithChildren) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // current + target position (in %)
  const current = useRef({ x: 50, y: 40 });
  const target = useRef({ x: 50, y: 40 });

  const rafId = useRef<number | null>(null);

  const writeVars = () => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${current.current.x}%`);
    el.style.setProperty("--my", `${current.current.y}%`);
  };

  const tick = () => {
    const c = current.current;
    const t = target.current;

    // smooth follow (lower = slower)
    const ease = 0.08;

    c.x += (t.x - c.x) * ease;
    c.y += (t.y - c.y) * ease;

    writeVars();

    const dx = Math.abs(t.x - c.x);
    const dy = Math.abs(t.y - c.y);

    if (dx < 0.02 && dy < 0.02) {
      rafId.current = null;
      return;
    }

    rafId.current = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    // init vars once
    writeVars();
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      ref={rootRef}
      onPointerMove={(e) => {
        // ignore touch drags
        if (e.pointerType === "touch") return;

        const el = rootRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        target.current = {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        };

        startLoop();
      }}
      onPointerLeave={() => {
        // return to a nice default spot
        target.current = { x: 50, y: 40 };
        startLoop();
      }}
      sx={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",

        // CSS vars for spotlight center
        "--mx": "50%",
        "--my": "40%",

        // Spotlight overlay (follows cursor)
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          mixBlendMode: "screen",
          background: `
            radial-gradient(520px 520px at var(--mx) var(--my),
              rgba(68, 161, 148, 0.18),
              transparent 60%
            ),
            radial-gradient(700px 700px at calc(var(--mx) + 14%) calc(var(--my) - 6%),
              rgba(83, 125, 150, 0.14),
              transparent 65%
            )
          `,
          filter: "blur(10px)",
          opacity: 0.9,
        },

        "@media (prefers-reduced-motion: reduce)": {
          // keep it static for reduced motion
          "&::before": { opacity: 0.6 },
        },
      }}
    >
      {/* Always-cover background (your original colors) */}
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
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 560 }}>{children}</Box>
      </Box>
    </Box>
  );
}