/** className을 안전하게 합치는 작은 유틸 (clsx 대체) */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 0~5 평점을 별점 문자열로 변환 */
export function formatRating(rating?: number): string {
  if (rating == null) return "평점 없음";
  return `★ ${rating.toFixed(1)}`;
}
