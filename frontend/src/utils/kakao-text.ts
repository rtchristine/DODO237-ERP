// ============================================================
// utils/kakao-text.ts
// 견적 정보 → 카카오톡 전송용 텍스트 생성 (도도237 표준 포맷)
// ============================================================

import { QuoteFormState } from '../types/quote';
import { ParsedInsurer } from '../types/parser';
import { ChannelKey } from '../constants/insurance';
import { getPrice } from './rate-calculator';

/** 채널 → 본문 헤더 라벨 */
const CHANNEL_HEADER: Record<ChannelKey, string> = {
  cm:  'CM다이렉트',
  tm:  'TM(전화가입)',
  off: '오프라인',
};

/** "YYYY-MM-DD" → "YYYY.MM.DD" */
function fmtDateDot(s: string): string {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : s;
}

/** 숫자 → "631,540원" */
function fmtWon(n: number): string {
  if (!n || n <= 0) return '-';
  return n.toLocaleString() + '원';
}

interface GenerateOptions {
  form: QuoteFormState;
  insurers: ParsedInsurer[];
  channel: ChannelKey;
  topN?: number;   // 상위 N개사만 포함 (기본 전체)
}

/**
 * 카카오톡 전송용 견적 텍스트 생성
 * 보여주신 도도237 표준 포맷:
 *   ■ 고객명 / 기간 / 전가입사 / 보험사별 가격 /
 *   차량번호 / 차량사항 / 운전사항 / 할인내용 / 담보 / 푸터
 */
export function generateKakaoText(opts: GenerateOptions): string {
  const { form, insurers, channel, topN } = opts;
  const out: string[] = [];

  // ── 1. 헤더: 고객명 / 안내 문구
  out.push(`■   ${form.insuredName || '고객'}`);
  out.push('고객님께  자동차 보험료 안내드립니다');

  // ── 2. 보험기간
  if (form.startDate || form.endDate) {
    out.push(`${fmtDateDot(form.startDate)} ~ ${fmtDateDot(form.endDate)}`);
  }

  // ── 3. 전 가입사
  if (form.prevInsurer) {
    out.push(`*전 가입사:    ${form.prevInsurer}`);
  }
  out.push('');

  // ── 4. 보험사별 보험료 (선택 채널 기준 정렬, 0원 제외)
  const valid  = insurers.filter(i => getPrice(i, channel) > 0);
  const sorted = [...valid].sort(
    (a, b) => getPrice(a, channel) - getPrice(b, channel)
  );
  const list = topN && topN > 0 ? sorted.slice(0, topN) : sorted;
  list.forEach(ins => {
    out.push(`${ins.name}   ${fmtWon(getPrice(ins, channel))}`);
  });
  if (list.length) out.push('------------------------------');

  // ── 5. 차량번호
  if (form.carno) {
    out.push('*차량번호');
    out.push(form.carno);
  }

  // ── 6. 차량사항
  if (form.carname || form.carYear || form.carPrice) {
    out.push('*차량사항');
    const carLine = [
      form.carname,
      form.carYear && `(${form.carYear}년식)`,
    ].filter(Boolean).join(' ');
    if (carLine) out.push(carLine);
    if (form.carPrice) out.push(`차량가액 ${form.carPrice}`);
  }
  out.push('');

  // ── 7. 운전사항
  if (form.driveRange || form.ageLimit) {
    out.push('*운전사항');
    const driveLine = [form.driveRange, form.ageLimit && `만 ${form.ageLimit.replace(/^만/, '')}`]
      .filter(Boolean).join('  / ');
    out.push(driveLine);
    out.push('');
  }

  // ── 8. 할인내용 (specialDiscounts 콤마 → 줄바꿈)
  if (form.specialDiscounts) {
    out.push('*할인내용');
    form.specialDiscounts
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(s => out.push(s));
  }
  out.push('------------------------------');

  // ── 9. 담보 본문
  out.push(`${CHANNEL_HEADER[channel]}-자상`);
  out.push('-책임보험 가입');
  out.push(`-대인2 : ${form.coverDaeinII || '무한'}(의무담보 포함)`);
  out.push(`-대물: ${form.coverDaemul || '5억원'}`);
  if (form.coverJasang) out.push(`-자동차상해: ${form.coverJasang}`);
  if (form.coverMuboheom) out.push(`-무보험차상해 : ${form.coverMuboheom}`);

  // 자기차량: "20%/20/50" 형식이면 자부담 안내 분리, 아니면 "가입"
  const jacha = form.coverJacha || '가입';
  const isDeductible = /\d+%/.test(jacha);
  out.push(`-자기차량손해 : ${isDeductible ? '가입' : jacha}`);
  if (isDeductible) {
    // "20%/20/50" → "자기부담금 손해액의 20%/20~50만공제"
    const m = jacha.match(/(\d+)%\/(\d+)\/(\d+)/);
    if (m) {
      out.push(`(자기부담금 손해액의 ${m[1]}%/${m[2]}~${m[3]}만공제)`);
    } else {
      out.push(`(${jacha})`);
    }
  }

  out.push('-물적할증기준 : 200만원');
  if (form.coverEmergency) {
    const em = form.coverEmergency === '확장형' ? '확장' : form.coverEmergency;
    out.push(`-긴급출동서비스(${em})`);
  }
  out.push('-------------------------------');

  // ── 10. 푸터
  out.push('위 견적은 참고 자료이며 보험사 인수규정에 따라');
  out.push('인수금지나 보험료가 변동될 수 있습니다.');

  // 연속 빈 줄 정리
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
