/**
 * 가벼운 인메모리 레이트리밋 (고정 윈도우 카운터).
 *
 * 서버리스 환경에서는 인스턴스마다 메모리가 분리되므로 전역적·엄밀한 보장은 아니지만,
 * 단일 인스턴스에서의 빠른 연타(저장 토글 남발 등)로 인한 DB 쓰기 폭주를 막는 1차 방어선이다.
 * 더 엄격한 제한이 필요해지면 Turso/Upstash 기반 분산 카운터로 교체한다.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * key 단위로 windowMs 동안 limit회까지 허용. 허용되면 true, 초과되면 false.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // 새 윈도우 시작. 맵이 과도하게 커지지 않도록 만료된 항목을 청소한다.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
