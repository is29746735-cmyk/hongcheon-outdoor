import { redirect } from "next/navigation";

/** 상세 페이지는 /spots/[id] 로 이전되었습니다. */
export default function PlaceDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/spots/${params.id}`);
}
