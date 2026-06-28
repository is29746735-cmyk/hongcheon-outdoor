import { useEffect, type RefObject } from "react";

/**
 * 모달 접근성 훅.
 * - 활성화 시 컨테이너 내부 첫 포커스 가능한 요소로 포커스를 이동하고,
 *   Tab/Shift+Tab을 컨테이너 안에서 순환시킨다(포커스가 뒤로 새지 않게).
 * - 비활성화 시 직전에 포커스돼 있던 요소로 포커스를 복원한다.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  containerRef: RefObject<T>,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    getFocusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
