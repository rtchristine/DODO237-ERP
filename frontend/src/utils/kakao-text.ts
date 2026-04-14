// ============================================================
// utils/kakao-text.ts
// 견적 정보 → 카카오톡 전송용 텍스트 생성
// ============================================================

import { QuoteFormState } from '../types/quote';
import { ParsedInsurer } from '../types/parser';
import { ChannelKey, CHANNEL_LABELS } from '../constants/insurance';
import { getPrice } from './rate-calculator';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

/** 숫자 → "1,234,560원" (0/음수는 '-') */
function fmtWon(n: number): string {
  if (!n || n <= 0) return '-';
  return n.toLocaleString() + '원';
}

/** "YYYY-MM-DD" → "YYYY년 M월 D일" (실패 시 원본) */
function fmtDate(s: string): string {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  return `${m[1]}년 ${parseInt(m[2])}월 ${parseInt(m[3])}일`;
}

/** 값이 있을 때만 "- 라벨: 값" 한 줄 반환 */
function line(label: string, value: string): string {
  return value ? `- ${label}: ${value}` : '';
}

interface GenerateOptions {
  form: QuoteFormState;
  insurers: ParsedInsurer[];
  channel: ChannelKey;
  topN?: number;   // 상위 N개사만 포함 (기본 전체)
}

/**
 * 카카오톡 전송용 견적 텍스트 생성
 * - 고객정보, 보험기간, 담보, 보험사별 보험료(선택 채널 기준 정렬)
 */
export function generateKakaoText(opts: GenerateOptions): string {
  const { form, insurers, channel, topN } = opts;

  // ── 1. 헤더
  const parts: string[] = [];
  parts.push('안녕하세요, 도도237 보험입니다. 🚗');
  parts.push('');

  // ── 2. 고객 / 차량 정보
  const carLabel = [form.carname, form.carYear && `${form.carYear}년식`]
    .filter(Boolean).join(' ');

  const infoLines = [
    line('피보험자', form.insuredName),
    line('차량번호', form.carno),
    line('차량', carLabel),
  ].filter(Boolean);

  if (infoLines.length) {
    parts.push('📌 고객정보');
    parts.push(...infoLines);
    parts.push('');
  }

  // ── 3. 보험기간 / 조건
  const period = (form.startDate || form.endDate)
    ? `${fmtDate(form.startDate)} ~ ${fmtDate(form.endDate)}`
    : '';

  const condLines = [
    line('보험기간', period),
    line('운전범위', form.driveRange),
    line('연령한정', form.ageLimit),
  ].filter(Boolean);

  if (condLines.length) {
    parts.push('📅 보험조건');
    parts.push(...condLines);
    parts.push('');
  }

  // ── 4. 담보 내용
  const coverLines = [
    line('대인II', form.coverDaeinII),
    line('대물', form.coverDaemul),
    line('자상', form.coverJasang),
    line('무보험', form.coverMuboheom),
    line('자차', form.coverJacha),
    line('긴급출동', form.coverEmergency),
  ].filter(Boolean);

  if (coverLines.length) {
    parts.push('🛡️ 담보내용');
    parts.push(...coverLines);
    parts.push('');
  }

  // ── 5. 보험사별 보험료 비교
  const valid = insurers.filter(i => getPrice(i, channel) > 0);
  if (valid.length) {
    const sorted = [...valid].sort(
      (a, b) => getPrice(a, channel) - getPrice(b, channel)
    );
    const list = topN ? sorted.slice(0, topN) : sorted;
    const lowest = getPrice(sorted[0], channel);

    parts.push(`💰 보험사별 보험료 (${CHANNEL_LABELS[channel]} 기준)`);
    list.forEach((ins, idx) => {
      const price = getPrice(ins, channel);
      const rankIcon = idx < 3 ? RANK_ICONS[idx] : `${idx + 1}위`;
      const diffFromLow = price - lowest;
      const diffTxt = diffFromLow > 0 ? ` (+${fmtWon(diffFromLow)})` : '';
      parts.push(`${rankIcon} ${ins.name}  ${fmtWon(price)}${diffTxt}`);
    });
    parts.push('');
  }

  // ── 6. 푸터
  parts.push('💡 위 금액은 참고용이며 실제 계약 시 조건에 따라 달라질 수 있습니다.');
  parts.push('문의 주시면 친절히 상담해 드리겠습니다 🙏');

  // 빈 줄 정리: 연속 공백 줄 제거 + trailing 공백 제거
  return parts
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
