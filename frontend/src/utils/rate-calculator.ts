// ============================================================
// utils/rate-calculator.ts
// 오프라인 보험료 → CM / TM 채널 보험료 계산
// ============================================================

import { CM_RATES, TM_RATES } from '../constants/insurance';
import { ParsedInsurer } from '../types/parser';

/** 10원 단위 절삭 */
function trunc10(n: number): number {
  return Math.floor(n / 10) * 10;
}

/** 오프라인 보험료 → CM 보험료 계산 */
export function calcCm(off: number, insurerId: string): number {
  const rate = CM_RATES[insurerId] ?? 0;
  return trunc10(off * (1 - rate));
}

/** 오프라인 보험료 → TM 보험료 계산 */
export function calcTm(off: number, insurerId: string): number {
  const rate = TM_RATES[insurerId] ?? 0;
  return trunc10(off * (1 - rate));
}

/** 보험사 보험료에 CM/TM 계산값 추가 */
export function enrichWithRates(insurers: ParsedInsurer[]): ParsedInsurer[] {
  return insurers.map(ins => ({
    ...ins,
    cm:  calcCm(ins.off, ins.id),
    tm:  calcTm(ins.off, ins.id),
  }));
}

/** 채널별 보험료 반환 */
export function getPrice(ins: ParsedInsurer, channel: 'off' | 'cm' | 'tm'): number {
  if (channel === 'cm') return ins.cm ?? 0;
  if (channel === 'tm') return ins.tm ?? 0;
  return ins.off ?? 0;
}
