// ============================================================
// types/quote.ts
// 견적 관련 TypeScript 인터페이스 정의
// ============================================================

/** 설계사 */
export interface Agent {
  id: number;
  name: string;
  phone?: string;
  status: string;
}

/** 견적 레코드 (DB → 프론트) */
export interface Quote {
  id: number;
  insured_name: string;
  car_number: string;
  car_name: string;
  car_year: number | null;
  car_price: string | null;
  start_date: string | null;
  end_date: string | null;
  usage_type: string | null;
  drive_range: string | null;
  age_limit: string | null;
  prev_insurer: string | null;
  disc_grade: string | null;
  pay_method: string | null;
  special_discounts: string | null;
  cover_daein2: string | null;
  cover_daemul: string | null;
  cover_jasang: string | null;
  cover_muboheom: string | null;
  cover_jacha: string | null;
  cover_emergency: string | null;
  memo: string | null;
  agent_id: number | null;
  status: 'draft' | 'sent' | 'contracted' | 'cancelled';
  created_at: string;
}

/** 견적 목록 API 응답 */
export interface QuoteListResponse {
  rows: Quote[];
  total: number;
}

/** 견적 폼 상태 (프론트엔드 전용) */
export interface QuoteFormState {
  insuredName: string;
  carno: string;
  carname: string;
  carYear: string;
  carPrice: string;
  startDate: string;
  endDate: string;
  usageType: string;
  driveRange: string;
  ageLimit: string;
  prevInsurer: string;
  discGrade: string;
  payMethod: string;
  specialDiscounts: string;
  coverDaeinII: string;
  coverDaemul: string;
  coverJasang: string;
  coverMuboheom: string;
  coverJacha: string;
  coverEmergency: string;
  memo: string;
  agentId: string;
}

/** 견적 저장 API 요청 바디 */
export interface QuoteSavePayload {
  insured_name: string;
  car_number: string;
  car_name: string;
  car_year: number | null;
  car_price: string | null;
  start_date: string | null;
  end_date: string | null;
  usage_type: string | null;
  drive_range: string | null;
  age_limit: string | null;
  prev_insurer: string | null;
  disc_grade: string | null;
  pay_method: string | null;
  special_discounts: string | null;
  cover_daein2: string | null;
  cover_daemul: string | null;
  cover_jasang: string | null;
  cover_muboheom: string | null;
  cover_jacha: string | null;
  cover_emergency: string | null;
  memo: string | null;
  agent_id: number | null;
  status: string;
}
