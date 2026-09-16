export type Confidence = "low" | "medium" | "high";

export interface ReviewItem {
  key: string; // activity key: course/module/lesson/id
  courseSlug: string;
  lessonHref: string;
  question: string;
  answer: string;
  explanation?: string;
  confidence: Confidence;
  nextReviewAt: number;
  interval: number; // days
  reviewCount: number;
}

const INTERVALS: Record<Confidence, number> = { low: 1, medium: 3, high: 7 };
const PROMOTE: Record<Confidence, Confidence> = { low: "medium", medium: "high", high: "high" };
const MS_PER_DAY = 86_400_000;

export function intervalFor(confidence: Confidence): number {
  return INTERVALS[confidence];
}

export function newReviewItem(
  base: Omit<ReviewItem, "nextReviewAt" | "interval" | "reviewCount">,
  now = Date.now(),
): ReviewItem {
  const interval = INTERVALS[base.confidence];
  return { ...base, interval, nextReviewAt: now + interval * MS_PER_DAY, reviewCount: 0 };
}

export function scheduleReview(item: ReviewItem, correct: boolean, now = Date.now()): ReviewItem {
  if (!correct) {
    return {
      ...item,
      confidence: "low",
      interval: INTERVALS.low,
      nextReviewAt: now + INTERVALS.low * MS_PER_DAY,
      reviewCount: item.reviewCount + 1,
    };
  }
  const promoted = PROMOTE[item.confidence];
  const interval = item.confidence === "high" ? Math.min(item.interval * 2, 30) : INTERVALS[promoted];
  return {
    ...item,
    confidence: promoted,
    interval,
    nextReviewAt: now + interval * MS_PER_DAY,
    reviewCount: item.reviewCount + 1,
  };
}

export function dueItems(items: ReviewItem[], now = Date.now()): ReviewItem[] {
  return items.filter((i) => i.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}
