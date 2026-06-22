import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { getPlaceById } from "@/data/places";
import { CATEGORY_LABELS } from "@/constants";
import SaveButton from "@/components/SaveButton";
import LoginPromptButton from "@/components/LoginPromptButton";

export const metadata: Metadata = { title: "저장한 장소" };

export default async function SavedPage() {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  // 비로그인 → 로그인 유도
  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-600">
          <Bookmark className="h-7 w-7" strokeWidth={2} />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-neutral-900">
          저장한 장소
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          마음에 드는 낚시터·캠핑장을 저장하려면 로그인하세요.
          <br />
          저장한 장소는 로그인하면 어디서든 다시 볼 수 있어요.
        </p>
        <div className="mt-6 flex justify-center">
          <LoginPromptButton />
        </div>
      </main>
    );
  }

  const rows = await db
    .select({ placeId: schema.savedPlaces.placeId })
    .from(schema.savedPlaces)
    .where(eq(schema.savedPlaces.userId, userId))
    .orderBy(desc(schema.savedPlaces.createdAt));

  const places = rows
    .map((r) => getPlaceById(r.placeId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-forest-800">저장한 장소</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {places.length > 0
          ? `${places.length}곳 저장됨`
          : "아직 저장한 장소가 없어요."}
      </p>

      {places.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-sm leading-relaxed text-neutral-500">
            장소 상세 페이지에서{" "}
            <span className="font-bold text-forest-700">이 장소 저장</span> 버튼을
            눌러 추가하세요.
          </p>
          <Link
            href="/#list"
            className="mt-4 inline-block rounded-full bg-forest-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-forest-700"
          >
            장소 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {places.map((place) => (
            <li
              key={place.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card"
            >
              <Link href={`/spots/${place.id}`} className="block">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-forest-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {CATEGORY_LABELS[place.category]}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {place.region}
                  </span>
                </div>
                <h2 className="mt-1.5 text-base font-extrabold text-neutral-900">
                  {place.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                  {place.summary}
                </p>
              </Link>
              <div className="mt-3">
                <SaveButton placeId={place.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
