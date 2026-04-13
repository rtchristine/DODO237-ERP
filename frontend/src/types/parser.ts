// ============================================================
// types/parser.ts
// 인스나라/아이코원 파싱 결과 타입 정의
// ============================================================

/** 파싱된 고객/차량 기본 정보 */
export interface ParsedInfo {
  name?: string;         // 피보험자명
  carno?: string;        // 차량번호
  carname?: string;      // 차명
  year?: string;         // 연식
  carPrice?: string;     // 차량가액
  startDate?: string;    // 보험시작일 (YYYY-MM-DD)
  period?: string;       // 보험기간 전체 (start~end)
  usage?: string;        // 용도
  drive?: string;        // 운전범위
  age?: string;          // 연령한정
  prev?: string;         // 전가입사
  discGrade?: string;    // 할인할증등급
  payMethod?: string;    // 납입방법
  specials?: string;     // 할인특약 (콤마 구분)
}

/** 파싱된 담보 항목 */
export interface ParsedCoverage {
  key: string;   // 예: '대물', '자기차량'
  val: string;   // 예: '5억원', '가입'
}

/** 파싱된 보험사 보험료 */
export interface ParsedInsurer {
  id: string;    // 예: 'samsung', 'hyundai'
  name: string;  // 예: '삼성', '현대'
  off: number;   // 오프라인 보험료 (원)
}

/** 전체 파싱 결과 */
export interface ParseResult {
  source: 'icowon' | 'insnara' | 'unknown';
  info: ParsedInfo;
  coverages: ParsedCoverage[];
  insurers: ParsedInsurer[];
}
