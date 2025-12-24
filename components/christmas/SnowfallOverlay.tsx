"use client";

import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useMemo, useState } from "react";

const Snowfall = dynamic(
  () => import("react-snowfall").then((mod: any) => mod.default ?? mod),
  { ssr: false }
) as unknown as ComponentType<any>;

export function SnowfallOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [snowflakeCount, setSnowflakeCount] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mediaQuery.matches);
    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const compute = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const lowPower = document.body.classList.contains("low-power-mode");
      if (lowPower) return isMobile ? 50 : 70;
      return isMobile ? 90 : 140;
    };

    const apply = () => setSnowflakeCount(compute());
    apply();

    const onResize = () => apply();
    window.addEventListener("resize", onResize);

    const t = window.setTimeout(apply, 1000);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  const style = useMemo<React.CSSProperties>(
    () => ({
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: 999,
    }),
    []
  );

  if (!enabled || snowflakeCount <= 0) return null;

  return <Snowfall style={style} snowflakeCount={snowflakeCount} />;
}
