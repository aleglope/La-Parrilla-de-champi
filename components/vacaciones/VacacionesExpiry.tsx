"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface VacacionesExpiryProps {
  serverNow: number;
  endsAt: number;
}

export default function VacacionesExpiry({ serverNow, endsAt }: VacacionesExpiryProps) {
  const router = useRouter();

  useEffect(() => {
    const startedAt = performance.now();
    const remainingAtMount = endsAt - serverNow;
    let timer: ReturnType<typeof setTimeout>;
    let reloading = false;

    const checkDeadline = () => {
      if (reloading) return;
      const remaining = remainingAtMount - (performance.now() - startedAt);
      if (remaining <= 0) {
        reloading = true;
        window.location.reload();
        return;
      }
      // Recheck in bounded chunks instead of relying on a single long timeout.
      timer = setTimeout(checkDeadline, Math.min(remaining, 24 * 60 * 60 * 1000));
    };
    const checkServerOnWake = () => {
      if (document.hidden || reloading) return;
      clearTimeout(timer);
      checkDeadline();
      // Server remains authoritative after sleep/BFCache, including platforms whose
      // monotonic clock pauses during system sleep. No client wall clock is trusted.
      if (!reloading) router.refresh();
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) checkServerOnWake();
    };

    checkDeadline();
    document.addEventListener("visibilitychange", checkServerOnWake);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkServerOnWake);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [serverNow, endsAt, router]);

  return null;
}
