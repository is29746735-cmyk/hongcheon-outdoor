import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { getPlaceById } from "@/data/places";
import LoginPromptButton from "@/components/LoginPromptButton";
import SavedList, { type SavedItem } from "@/components/SavedList";

export const metadata: Metadata = {
  title: "저장한 장소",
  description: "내가 저장한 홍천강 낚시터·캠핑장·차박지를 한곳에서 다시 봅니다.",
  // 개인화된 비공개 페이지 — 검색엔진 색인 제외
  robots: { index: false, follow: false },
};

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

  const items: SavedItem[] = rows
    .map((r) => getPlaceById(r.placeId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      region: p.region,
      summary: p.summary,
    }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-forest-800">저장한 장소</h1>
      <SavedList initial={items} />
    </main>
  );
}
