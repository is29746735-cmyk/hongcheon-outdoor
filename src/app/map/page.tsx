import { redirect } from "next/navigation";

/**
 * 임베디드 지도는 외부 지도(네이버·카카오·구글) 링크로 대체되었습니다.
 * 기존 /map 링크는 메인 화면의 장소 목록으로 바로 보냅니다.
 */
export default function MapPage() {
  redirect("/#list");
}
