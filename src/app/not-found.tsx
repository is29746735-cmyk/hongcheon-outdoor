import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-neutral-600">
        요청하신 장소나 페이지가 존재하지 않습니다.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-forest-600 px-6 py-3 font-semibold text-white hover:bg-forest-700"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
