"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Adapted from React Bits TiltedCard. See REACT-BITS-LICENSE.txt.
interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Upstream's damped spring, stepped at 240 Hz for consistent settling.
function step(state: Record<string, number>, key: string, target: number, dt: number) {
  const velocity = `v${key}`;
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / steps;
  for (let index = 0; index < steps; index++) {
    state[velocity] += (144 * (target - state[key]) - 20.4 * state[velocity]) * h;
    state[key] += state[velocity] * h;
  }
  if (Math.abs(target - state[key]) < 0.001 && Math.abs(state[velocity]) < 0.01) {
    state[key] = target;
    state[velocity] = 0;
    return false;
  }
  return true;
}

export default function TiltedCard({
  children,
  className,
  rotateAmplitude = 9,
  scaleOnHover = 1.025,
}: TiltedCardProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const body = bodyRef.current;
    if (!area || !body) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const state = { rx: 0, vrx: 0, ry: 0, vry: 0, lift: 0, vlift: 0 };
    let targetX = 0;
    let targetY = 0;
    let targetLift = 0;
    let raf = 0;
    let last = 0;

    const enabled = () => !reduced.matches && fine.matches && !document.hidden;
    const frame = (now: number) => {
      raf = 0;
      if (!enabled()) return;
      const dt = clamp((now - last) / 1000 || 1 / 60, 0, 0.05);
      last = now;
      const movingX = step(state, "rx", targetX, dt);
      const movingY = step(state, "ry", targetY, dt);
      const movingLift = step(state, "lift", targetLift, dt);
      const scale = 1 + (scaleOnHover - 1) * state.lift;
      body.style.transform = `rotateX(${state.rx.toFixed(3)}deg) rotateY(${state.ry.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
      if (movingX || movingY || movingLift) raf = requestAnimationFrame(frame);
      else if (!targetLift) body.style.removeProperty("transform");
    };
    const wake = () => {
      if (raf || !enabled()) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      Object.keys(state).forEach((key) => { state[key as keyof typeof state] = 0; });
      targetX = targetY = targetLift = 0;
      body.style.removeProperty("transform");
    };
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !enabled()) return;
      const bounds = area.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      targetX = -clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1) * rotateAmplitude;
      targetY = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1) * rotateAmplitude;
      targetLift = 1;
      wake();
    };
    const handleLeave = () => {
      targetX = targetY = targetLift = 0;
      wake();
    };
    area.addEventListener("pointermove", handleMove);
    area.addEventListener("pointerleave", handleLeave);
    area.addEventListener("pointercancel", reset);
    reduced.addEventListener("change", reset);
    fine.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      area.removeEventListener("pointermove", handleMove);
      area.removeEventListener("pointerleave", handleLeave);
      area.removeEventListener("pointercancel", reset);
      reduced.removeEventListener("change", reset);
      fine.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [rotateAmplitude, scaleOnHover]);

  return (
    <div ref={areaRef} className={className} style={{ perspective: 1100 }} data-vacation-tilt="">
      <div ref={bodyRef} style={{ transformStyle: "preserve-3d" }} data-vacation-tilt-body="">
        {children}
      </div>
    </div>
  );
}
