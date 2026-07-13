import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  /** 모든 필터를 기본값으로 되돌리는 콜백 */
  onReset: () => void;
}

/**
 * 필터링 결과가 0건일 때 카드 리스트 영역에 표시하는 안내 컴포넌트.
 * 안내 문구 + [필터 초기화] 버튼을 제공한다.
 */
export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-forest-200 bg-sand-50 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-700">
        <SearchX className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <p className="mt-5 text-lg font-extrabold text-forest-800">
        조건에 맞는 홍천 아웃도어 스팟이 없습니다.
      </p>
      <p className="mt-1.5 text-sm text-neutral-500">
        필터를 초기화해 보세요!
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-1.5 rounded-sm bg-forest-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-md"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2.2} />
        필터 초기화
      </button>
    </div>
  );
}
