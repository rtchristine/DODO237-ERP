// ============================================================
// components/RateTable.tsx
// CM / TM / 오프라인 3채널 보험료 비교표
// ============================================================

import React, { useState } from 'react';
import { ParsedInsurer } from '../types/parser';
import { enrichWithRates, getPrice } from '../utils/rate-calculator';
import { CHANNEL_LABELS, ChannelKey } from '../constants/insurance';

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
  } as React.CSSProperties,
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  } as React.CSSProperties,
  th: {
    padding: '10px 14px',
    background: '#f8f9ff',
    fontWeight: 600,
    color: '#555',
    textAlign: 'left' as const,
    borderBottom: '2px solid #eee',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  td: {
    padding: '11px 14px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
  } as React.CSSProperties,
  rank1: {
    background: '#fff9e6',
    fontWeight: 700,
    color: '#e67e22',
  } as React.CSSProperties,
  price: {
    fontWeight: 700,
    color: '#e74c3c',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  priceGray: {
    color: '#aaa',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  discBadge: {
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 10,
    background: '#eef2ff',
    color: '#6c63ff',
    fontWeight: 600,
    marginLeft: 4,
  } as React.CSSProperties,
  emptyMsg: {
    textAlign: 'center' as const,
    padding: 40,
    color: '#aaa',
  } as React.CSSProperties,
};

interface Props {
  insurers: ParsedInsurer[];  // 파싱된 보험사 목록 (off 값 포함)
}

export default function RateTable({ insurers }: Props) {
  const [channel, setChannel] = useState<ChannelKey>('cm');

  if (!insurers.length) {
    return (
      <div style={S.wrap}>
        <div style={S.sectionTitle}>💰 보험료 비교</div>
        <div style={S.emptyMsg}>
          📋 붙여넣기 자동 입력으로 견적을 파싱하면<br />
          보험사별 비교표가 여기에 표시됩니다.
        </div>
      </div>
    );
  }

  // CM/TM 계산값 추가
  const enriched = enrichWithRates(insurers);

  // 현재 채널 기준으로 정렬
  const sorted = [...enriched].sort(
    (a, b) => getPrice(a, channel) - getPrice(b, channel)
  );

  // 채널 탭 버튼
  function TabBtn({ ch, label }: { ch: ChannelKey; label: string }) {
    const active = channel === ch;
    return (
      <button
        onClick={() => setChannel(ch)}
        style={{
          padding: '7px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: active ? 700 : 400,
          background: active ? '#6c63ff' : '#f5f5f5',
          color: active ? '#fff' : '#555',
          border: active ? 'none' : '1px solid #ddd',
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    );
  }

  // 할인율 표시
  function DiscBadge({ id, ch }: { id: string; ch: ChannelKey }) {
    if (ch === 'off') return null;
    const { CM_RATES, TM_RATES } = require('../constants/insurance');
    const rate = ch === 'cm' ? CM_RATES[id] : TM_RATES[id];
    if (!rate) return null;
    return (
      <span style={S.discBadge}>
        {(rate * 100).toFixed(1)}%↓
      </span>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={S.sectionTitle}>💰 보험료 비교</div>

      {/* 채널 탭 */}
      <div style={S.tabRow}>
        {(Object.entries(CHANNEL_LABELS) as [ChannelKey, string][]).map(([ch, label]) => (
          <TabBtn key={ch} ch={ch} label={label} />
        ))}
      </div>

      {/* 비교표 */}
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>순위</th>
            <th style={S.th}>보험사</th>
            <th style={S.th}>{CHANNEL_LABELS[channel]} 보험료</th>
            {channel !== 'off' && <th style={S.th}>오프라인 대비</th>}
            {channel === 'cm' && <th style={S.th}>TM 보험료</th>}
            {channel === 'tm' && <th style={S.th}>CM 보험료</th>}
            <th style={S.th}>오프라인</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ins, idx) => {
            const mainPrice = getPrice(ins, channel);
            const isTop = idx === 0;
            const rowStyle = isTop ? { ...S.rank1 } : {};
            const offPrice = ins.off;
            const saving = channel !== 'off'
              ? offPrice - mainPrice
              : 0;

            return (
              <tr key={ins.id} style={rowStyle}>
                {/* 순위 */}
                <td style={{ ...S.td, ...rowStyle }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}위`}
                </td>

                {/* 보험사명 */}
                <td style={{ ...S.td, ...rowStyle, fontWeight: 600 }}>
                  {ins.name}
                  <DiscBadge id={ins.id} ch={channel} />
                </td>

                {/* 메인 채널 보험료 */}
                <td style={{ ...S.td, ...rowStyle, ...S.price }}>
                  {mainPrice > 0 ? mainPrice.toLocaleString() + '원' : '-'}
                </td>

                {/* 오프라인 대비 절약액 */}
                {channel !== 'off' && (
                  <td style={{ ...S.td, ...rowStyle }}>
                    {saving > 0 ? (
                      <span style={{ color: '#27ae60', fontWeight: 600 }}>
                        -{saving.toLocaleString()}원
                      </span>
                    ) : '-'}
                  </td>
                )}

                {/* 반대 채널 (CM탭이면 TM, TM탭이면 CM) */}
                {channel === 'cm' && (
                  <td style={{ ...S.td, ...S.priceGray }}>
                    {ins.tm && ins.tm > 0 ? ins.tm.toLocaleString() + '원' : '-'}
                  </td>
                )}
                {channel === 'tm' && (
                  <td style={{ ...S.td, ...S.priceGray }}>
                    {ins.cm && ins.cm > 0 ? ins.cm.toLocaleString() + '원' : '-'}
                  </td>
                )}

                {/* 오프라인 */}
                <td style={{ ...S.td, ...S.priceGray }}>
                  {offPrice > 0 ? offPrice.toLocaleString() + '원' : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 요약 */}
      {sorted.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          💡 최저가: <strong style={{ color: '#e74c3c' }}>
            {sorted[0].name} {getPrice(sorted[0], channel).toLocaleString()}원
          </strong>
          {' / '}
          최고가: {sorted[sorted.length - 1].name}{' '}
          {getPrice(sorted[sorted.length - 1], channel).toLocaleString()}원
          {' / '}
          차이: {(getPrice(sorted[sorted.length - 1], channel) - getPrice(sorted[0], channel)).toLocaleString()}원
        </div>
      )}
    </div>
  );
}
