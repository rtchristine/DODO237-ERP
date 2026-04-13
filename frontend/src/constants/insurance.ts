// ============================================================
// constants/insurance.ts
// 보험 관련 드롭다운 옵션 및 상수 정의
// ============================================================

/** 전가입 보험사 목록 */
export const INSURER_LIST = [
  '삼성화재', '현대해상', 'DB손해보험', 'KB손해보험',
  '한화손해보험', '흥국화재', '메리츠화재',
  '하나손해보험', '롯데손해보험', 'MG손해보험',
] as const;

/** 운전범위 옵션 */
export const DRIVE_RANGE_OPTIONS = [
  '누구나', '부부한정', '부부+자녀', '가족한정',
  '1인한정', '기명1인한정', '임직원한정',
] as const;

/** 연령한정 옵션 */
export const AGE_LIMIT_OPTIONS = [
  '만26세이상', '만35세이상', '만43세이상',
  '만48세이상', '만61세이상', '전연령',
] as const;

/** 대물 담보 옵션 */
export const DAEMUL_OPTIONS = [
  '2억원', '3억원', '5억원', '10억원',
] as const;

/** 긴급출동 옵션 */
export const EMERGENCY_OPTIONS = [
  '기본형', '고급형', '확장형', '미가입',
] as const;

/** 납입방법 옵션 */
export const PAY_METHOD_OPTIONS = [
  '일시납', '월납', '연납',
] as const;

/** 견적 상태 정의 */
export const QUOTE_STATUS = {
  draft:      { label: '작성중',   color: '#f39c12' },
  sent:       { label: '전달완료', color: '#3498db' },
  contracted: { label: '계약완료', color: '#27ae60' },
  cancelled:  { label: '취소',     color: '#e74c3c' },
} as const;

/** 빈 폼 초기값 */
export const EMPTY_QUOTE_FORM = {
  insuredName: '',
  carno: '',
  carname: '',
  carYear: '',
  carPrice: '',
  startDate: '',
  endDate: '',
  usageType: '',
  driveRange: '',
  ageLimit: '',
  prevInsurer: '',
  discGrade: '',
  payMethod: '',
  specialDiscounts: '',
  coverDaeinII: '무한',
  coverDaemul: '5억원',
  coverJasang: '',
  coverMuboheom: '',
  coverJacha: '가입',
  coverEmergency: '',
  memo: '',
  agentId: '',
};
