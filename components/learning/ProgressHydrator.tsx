"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { isEmptySnapshot, mergeSnapshots, pullSnapshot, pushSnapshot, type Snapshot } from "@/lib/learning/sync";

function snapshotOf(): Snapshot {
  const s = useProgressStore.getState();
  return { activities: s.activities, lessons: s.lessons, lastVisited: s.lastVisited, review: s.review };
}

/**
 * 1. Rehydrate the localStorage copy after mount (avoids SSR mismatch).
 * 2. If a database is configured, pull the server snapshot, merge per key, and push the result.
 * 3. Afterwards, debounce-push every change so another machine can pick it up.
 */
export function ProgressHydrator() {
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      await useProgressStore.persist.rehydrate();
      const store = useProgressStore.getState();
      store.setHydrated(true);

      const { state, data } = await pullSnapshot();
      if (cancelled) return;
      store.setSync(state);
      if (state !== "synced") return;

      const local = snapshotOf();
      const merged = data ? mergeSnapshots(data, local) : local;
      if (JSON.stringify(merged) !== JSON.stringify(local)) useProgressStore.getState().replaceAll(merged);
      if (!data || JSON.stringify(merged) !== JSON.stringify(data)) {
        if (!isEmptySnapshot(merged)) useProgressStore.getState().setSync(await pushSnapshot(merged));
      }

      let last = JSON.stringify(snapshotOf());
      unsubscribe = useProgressStore.subscribe((s) => {
        const next = JSON.stringify({ activities: s.activities, lessons: s.lessons, lastVisited: s.lastVisited, review: s.review });
        if (next === last) return;
        last = next;
        if (timer) clearTimeout(timer);
        useProgressStore.getState().setSync("saving");
        timer = setTimeout(async () => {
          const result = await pushSnapshot(snapshotOf());
          if (!cancelled) useProgressStore.getState().setSync(result);
        }, 1200);
      });
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);
  return null;
}
