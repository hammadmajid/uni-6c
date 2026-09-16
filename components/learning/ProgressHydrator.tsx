"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/learning/progress-store";

/** Rehydrates the persisted progress store after mount so SSR markup never mismatches. */
export function ProgressHydrator() {
  useEffect(() => {
    useProgressStore.persist.rehydrate();
    useProgressStore.getState().setHydrated(true);
  }, []);
  return null;
}
