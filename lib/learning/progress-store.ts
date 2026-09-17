"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Confidence, type ReviewItem, newReviewItem, scheduleReview } from "./spaced";

export interface Activity {
  status: "not-started" | "in-progress" | "completed";
  attempts: number;
  correct: boolean;
  lastAttemptAt: number | null;
  confidence: Confidence | null;
  hintsUsed: number;
  /** What the learner last submitted (option text, typed value, prediction, or serialised order). */
  lastAnswer?: string | null;
  /** The learner gave up and asked for the answer. */
  revealed?: boolean;
}

const emptyActivity: Activity = {
  status: "not-started",
  attempts: 0,
  correct: false,
  lastAttemptAt: null,
  confidence: null,
  hintsUsed: 0,
  lastAnswer: null,
  revealed: false,
};

export type SyncState = "checking" | "local-only" | "unauthorized" | "synced" | "saving" | "error";

interface ProgressState {
  hydrated: boolean;
  sync: SyncState;
  activities: Record<string, Activity>;
  lessons: Record<string, { completedAt: number }>;
  lastVisited: Record<string, { href: string; title: string; at: number }>;
  review: ReviewItem[];

  setHydrated: (v: boolean) => void;
  setSync: (s: SyncState) => void;
  /** Replace the persisted slice wholesale (used after merging with the server). */
  replaceAll: (s: { activities: Record<string, Activity>; lessons: Record<string, { completedAt: number }>; lastVisited: Record<string, { href: string; title: string; at: number }>; review: ReviewItem[] }) => void;
  getActivity: (key: string) => Activity;
  recordAttempt: (key: string, correct: boolean, answer?: string) => void;
  recordReveal: (key: string) => void;
  recordHint: (key: string) => void;
  setConfidence: (key: string, c: Confidence) => void;
  completeLesson: (key: string) => void;
  uncompleteLesson: (key: string) => void;
  setLastVisited: (courseSlug: string, href: string, title: string) => void;
  addReview: (item: Omit<ReviewItem, "nextReviewAt" | "interval" | "reviewCount">) => void;
  gradeReview: (key: string, correct: boolean) => void;
  removeReview: (key: string) => void;
  resetAll: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      sync: "checking",
      activities: {},
      lessons: {},
      lastVisited: {},
      review: [],

      setHydrated: (v) => set({ hydrated: v }),
      setSync: (s) => set({ sync: s }),
      replaceAll: (s) => set({ activities: s.activities, lessons: s.lessons, lastVisited: s.lastVisited, review: s.review }),

      getActivity: (key) => get().activities[key] ?? emptyActivity,

      recordAttempt: (key, correct, answer) =>
        set((s) => {
          const prev = s.activities[key] ?? emptyActivity;
          return {
            activities: {
              ...s.activities,
              [key]: {
                ...prev,
                attempts: prev.attempts + 1,
                correct: prev.correct || correct,
                status: correct ? "completed" : "in-progress",
                lastAttemptAt: Date.now(),
                lastAnswer: answer ?? prev.lastAnswer ?? null,
              },
            },
          };
        }),

      recordReveal: (key) =>
        set((s) => {
          const prev = s.activities[key] ?? emptyActivity;
          return { activities: { ...s.activities, [key]: { ...prev, revealed: true, lastAttemptAt: Date.now() } } };
        }),

      recordHint: (key) =>
        set((s) => {
          const prev = s.activities[key] ?? emptyActivity;
          return { activities: { ...s.activities, [key]: { ...prev, hintsUsed: prev.hintsUsed + 1 } } };
        }),

      setConfidence: (key, c) =>
        set((s) => {
          const prev = s.activities[key] ?? emptyActivity;
          return { activities: { ...s.activities, [key]: { ...prev, confidence: c } } };
        }),

      completeLesson: (key) => set((s) => ({ lessons: { ...s.lessons, [key]: { completedAt: Date.now() } } })),

      uncompleteLesson: (key) =>
        set((s) => {
          const next = { ...s.lessons };
          delete next[key];
          return { lessons: next };
        }),

      setLastVisited: (courseSlug, href, title) =>
        set((s) => ({ lastVisited: { ...s.lastVisited, [courseSlug]: { href, title, at: Date.now() } } })),

      addReview: (item) =>
        set((s) => {
          const existing = s.review.find((r) => r.key === item.key);
          if (existing) {
            // Re-rating an item: reschedule from its new confidence.
            const fresh = newReviewItem({ ...existing, ...item });
            return { review: s.review.map((r) => (r.key === item.key ? { ...fresh, reviewCount: existing.reviewCount } : r)) };
          }
          return { review: [...s.review, newReviewItem(item)] };
        }),

      gradeReview: (key, correct) =>
        set((s) => ({ review: s.review.map((r) => (r.key === key ? scheduleReview(r, correct) : r)) })),

      removeReview: (key) => set((s) => ({ review: s.review.filter((r) => r.key !== key) })),

      resetAll: () => set({ activities: {}, lessons: {}, lastVisited: {}, review: [] }),
    }),
    {
      name: "uni-6c-progress",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        activities: s.activities,
        lessons: s.lessons,
        lastVisited: s.lastVisited,
        review: s.review,
      }),
    },
  ),
);

/** Fraction of a course's lessons marked complete. */
export function courseProgress(lessons: Record<string, { completedAt: number }>, courseSlug: string, total: number) {
  const done = Object.keys(lessons).filter((k) => k.startsWith(courseSlug + "/")).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}
