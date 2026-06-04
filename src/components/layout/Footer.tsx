import { Mountain } from "lucide-react";
import { SITE } from "@/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-forest-800 text-forest-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">
            <Mountain size={18} strokeWidth={2.2} />
          </span>
          <p className="text-base font-extrabold">{SITE.name}</p>
        </div>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-forest-100/80">
          {SITE.description}
        </p>
        <p className="mt-6 text-xs text-forest-100/60">
          © {new Date().getFullYear()} {SITE.name}. 정보는 공공·전문 출처로 검증해
          제공하며, 방문 전 운영 상태를 확인하세요.
        </p>
      </div>
    </footer>
  );
}
