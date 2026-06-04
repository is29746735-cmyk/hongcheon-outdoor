import { redirect } from "next/navigation";

/** 장소 목록은 메인 화면으로 통합되었습니다. */
export default function PlacesPage() {
  redirect("/#list");
}
