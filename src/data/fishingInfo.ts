/**
 * 낚시 전 확인 정보 — 금어기·금지체장 및 안전·법규 주의사항.
 *
 * 검증 원칙(이 프로젝트 1번 원칙): 권위 출처로 교차검증된 사실만 단정한다.
 * - 금어기·금지체장: 「수산자원관리법」 제14조 및 같은 법 시행령 별표(금어기·금지체장),
 *   해양수산부 고시 기준. 쏘가리는 강원(북한강 수계) 적용 기간으로 정리.
 * - 생태계교란 생물(배스·블루길): 환경부 지정, 「생물다양성 보전 및 이용에 관한 법률」.
 * - 전국 단위로 미지정인 어종(붕어·잉어·메기·누치 등)은 "미지정"으로만 안내하고
 *   임의로 기간을 만들지 않는다. 출처가 불확실한 항목(뱀장어·어름치 등)은 싣지 않는다.
 *
 * 최종 검증일: 2026-06-22.
 */

export interface ClosedSeasonRule {
  /** 어종명 */
  species: string;
  /** 금어기(포획금지기간) */
  closedSeason: string;
  /** 금지체장(포획금지 크기) */
  minSize: string;
  /** 지역·구간 적용에 대한 보충 설명 */
  note?: string;
}

export interface FishingCaution {
  title: string;
  body: string;
}

export interface SourceRef {
  label: string;
  url: string;
}

/** 홍천강(북한강 수계, 강원특별자치도) 낚시인에게 해당하는 금어기·금지체장 */
export const FISHING_CLOSED_SEASONS: ClosedSeasonRule[] = [
  {
    species: "쏘가리",
    closedSeason: "강 본류 5월 1일~6월 10일 · 댐·호소 5월 20일~6월 30일",
    minSize: "18cm 미만 연중 포획 금지",
    note: "홍천강 본류는 5월 1일~6월 10일이 기준이며, 댐·호소에 해당하는 구간은 5월 20일~6월 30일이 적용됩니다. 구간 경계는 수역마다 다를 수 있어 방문 전 확인이 필요합니다.",
  },
];

/** 전국 단위 금어기·금지체장이 지정되지 않은 주요 어종 안내(임의 기간 생성 금지) */
export const FISHING_NO_NATIONAL_RULE =
  "붕어·잉어·메기·누치 등은 전국 단위 금어기·금지체장이 지정되어 있지 않습니다. 다만 시·도 내수면 규정이나 유료 낚시터 자체 규정이 있을 수 있어 현장 확인이 필요합니다.";

/** 안전·법규·환경 주의사항 (검증된 법령·일반 안전 지침 기반) */
export const FISHING_CAUTIONS: FishingCaution[] = [
  {
    title: "생태교란종은 되살려 보내면 안 됩니다",
    body: "배스·블루길은 환경부가 지정한 생태계교란 생물입니다. 살아 있는 채로 다시 풀어주거나 다른 수역으로 옮기는 것은 「생물다양성 보전 및 이용에 관한 법률」에 따라 금지되며, 위반 시 처벌받을 수 있습니다.",
  },
  {
    title: "수위·방류에 주의하세요",
    body: "상류 댐 방류나 비가 온 뒤에는 수위와 유속이 갑자기 변할 수 있습니다. 우천 시·야간에는 강변 노지와 여울 진입을 피하세요.",
  },
  {
    title: "허용된 낚시 도구만 사용하세요",
    body: "투망·그물·통발과 전기·약품을 이용한 포획은 불법입니다. 일반 낚시인은 낚싯대 등 허용된 도구로만 낚시할 수 있습니다.",
  },
  {
    title: "낚시 금지구역과 유료터 규정을 확인하세요",
    body: "상수원보호구역 등 낚시가 금지·제한된 구간이 있습니다. 유료 낚시터는 이용 요금·어종·규정이 별도이니 방문 전 확인하세요.",
  },
  {
    title: "1급수와 현장을 깨끗이",
    body: "낚싯줄·납봉돌·쓰레기는 반드시 되가져가고, 세제나 오염물을 강에 흘리지 마세요. 여울·바위는 미끄러우니 안전화와 구명조끼를 착용하세요.",
  },
];

export const FISHING_SOURCES: SourceRef[] = [
  {
    label: "해양수산부 · 수산자원의 금어기·금지체장 기준",
    url: "https://www.mof.go.kr/doc/ko/selectDoc.do?docSeq=64389&menuSeq=851&bbsSeq=22",
  },
  {
    label: "국립수산과학원 · 금어기·금지체장 소개",
    url: "https://www.nifs.go.kr/contents/actionContentsCons0148.do",
  },
  {
    label: "정부24 · 전국 낚시금지·제한구역 조회",
    url: "https://www.gov.kr/portal/service/serviceInfo/PTR000051942",
  },
];
