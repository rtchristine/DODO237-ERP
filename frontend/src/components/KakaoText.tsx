// ============================================================
// components/KakaoText.tsx
// 카카오톡 전송용 견적 텍스트 생성 / 미리보기 / 복사
// ============================================================

import React, { useMemo, useState } from 'react';
import { QuoteFormState } from '../types/quote';
import { ParsedInsurer } from '../types/parser';
import { CHANNEL_LABELS, ChannelKey } from '../constants/insurance';
import { generateKakaoText } from '../utils/kakao-text';

// ── 스타일 상수
const S = {
  wrap: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    marginBottom: 16,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#6c63ff',
    borderBottom: '2px solid #6c63ff',
    paddingBottom: 6,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  toolbar: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  chanBtn: (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    background: active ? '#6c63ff' : '#f5f5f5',
    color: active ? '#fff' : '#555',
    border: active ? 'none' : '1px solid #ddd',
    cursor: 'pointer',
  }),
  textarea: {
    width: '100%',
    minHeight: 280,
    padding: 14,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    background: '#fefdf6',
  } as React.CSSProperties,
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  } as React.CSSProperties,
  copyBtn: (copied: boolean): React.CSSProperties => ({
    padding: '9px 20px',
    background: copied ? '#27ae60' : '#fee500',
    color: copied ? '#fff' : '#3c1e1e',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
  }),
  resetBtn: {
    padding: '9px 14px',
    background: '#f5f5f5',
    color: '#555',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer',
  } as React.CSSProperties,
  emptyMsg: {
    textAlign: 'center' as const,
    padding: 30,
    color: '#aaa',
    fontSize: 13,
  } as React.CSSProperties,
  topNRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#666',
  } as React.CSSProperties,
  topNInput: {
    width: 50,
    padding: '5px 8px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 12,
    textAlign: 'center' as const,
  } as React.CSSProperties,
};

interface Props {
  form: QuoteFormState;
  insurers: ParsedInsurer[];
}

export default function KakaoText({ form, insurers }: Props) {
  const [channel, setChannel] = useState<ChannelKey>('cm');
  const [topN, setTopN] = useState<number>(0);  // 0 = 전체
  const [override, setOverride] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 자동 생성 텍스트 (override가 있으면 그것 우선)
  const autoText = useMemo(
    () => generateKakaoText({
      form,
      insurers,
      channel,
      topN: topN > 0 ? topN : undefined,
    }),
    [form, insurers, channel, topN]
  );
  const text = override ?? autoText;

  // 클립보드 복사
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  }

  // 편집 내용 원본으로 되돌리기
  function handleReset() {
    setOverride(null);
  }

  // 고객정보/보험사 둘 다 비어있으면 안내만 표시
  const isEmpty = !form.insuredName && !form.carno && insurers.length === 0;
  if (isEmpty) {
    return (
      <div style={S.wrap}>
        <div style={S.sectionTitle}>💬 카카오톡 전송 텍스트</div>
        <div style={S.emptyMsg}>
          고객 정보를 입력하거나 붙여넣기로 견적을 파싱하면<br />
          카카오톡 전송용 문구가 자동 생성됩니다.
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={S.sectionTitle}>
        <span>💬 카카오톡 전송 텍스트</span>
        <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>
          {text.length}자
        </span>
      </div>

      {/* 옵션 툴바 */}
      <div style={S.toolbar}>
        <span style={{ fontSize: 12, color: '#666' }}>채널</span>
        {(Object.entries(CHANNEL_LABELS) as [ChannelKey, string][]).map(([ch, label]) => (
          <button
            key={ch}
            onClick={() => { setChannel(ch); setOverride(null); }}
            style={S.chanBtn(channel === ch)}
          >
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={S.topNRow}>
          <label htmlFor="topN">상위</label>
          <input
            id="topN"
            type="number"
            min={0}
            max={20}
            value={topN}
            onChange={e => { setTopN(parseInt(e.target.value) || 0); setOverride(null); }}
            style={S.topNInput}
          />
          <span>개사 (0=전체)</span>
        </div>
      </div>

      {/* 텍스트 미리보기 / 편집 */}
      <textarea
        style={S.textarea}
        value={text}
        onChange={e => setOverride(e.target.value)}
      />

      {/* 액션 버튼 */}
      <div style={S.actionBar}>
        {override !== null && (
          <button onClick={handleReset} style={S.resetBtn}>↺ 자동 생성으로 복원</button>
        )}
        <button onClick={handleCopy} style={S.copyBtn(copied)}>
          {copied ? '✓ 복사됨' : '📋 카카오톡용 복사'}
        </button>
      </div>
    </div>
  );
}
