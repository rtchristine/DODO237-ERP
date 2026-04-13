// ============================================================
// pages/QuoteList.tsx
// 견적 목록 페이지 (UI 렌더링 전담)
// 로직은 hooks/useQuoteList.ts 참조
// ============================================================

import React, { useState } from 'react';
import { useQuoteList } from '../hooks/useQuoteList';
import { Quote }        from '../types/quote';
import { QUOTE_STATUS } from '../constants/insurance';
import QuoteForm        from '../components/QuoteForm';

const PAGE_SIZE = 20;

export default function QuoteList() {
  const {
    quotes, total, page, search, loading,
    setPage, setSearch, reload, deleteQuote,
  } = useQuoteList();

  const [editId, setEditId]     = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 폼 닫기 (저장 시 목록 새로고침)
  function handleClose(saved?: boolean) {
    setShowForm(false);
    setEditId(null);
    if (saved) reload();
  }

  // 폼 화면
  if (showForm) {
    return <QuoteForm quoteId={editId} onClose={handleClose} />;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* 검색 + 신규 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 고객명, 차량번호 검색..."
          style={{
            padding: '8px 12px', border: '1px solid #ddd',
            borderRadius: 8, fontSize: 13, width: 220, outline: 'none',
          }}
        />
        <button
          onClick={() => { setEditId(null); setShowForm(true); }}
          style={{
            padding: '10px 20px', background: '#6c63ff',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          + 새 견적
        </button>
      </div>

      {/* 목록 테이블 */}
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>⏳ 불러오는 중...</div>
        ) : quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div>견적이 없습니다.</div>
            <button
              onClick={() => { setEditId(null); setShowForm(true); }}
              style={{ marginTop: 16, padding: '10px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
            >
              + 새 견적 입력
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9ff', borderBottom: '2px solid #eee' }}>
                {['#', '피보험자', '차량번호', '차명', '보험시작일', '상태', '담보', ''].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: Quote, i: number) => {
                const status = QUOTE_STATUS[q.status] ?? { label: q.status, color: '#999' };
                return (
                  <tr
                    key={q.id}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => { setEditId(q.id); setShowForm(true); }}
                  >
                    <td style={{ padding: '11px 14px', color: '#999' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{q.insured_name || '-'}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace' }}>{q.car_number || '-'}</td>
                    <td style={{ padding: '11px 14px', color: '#555' }}>{q.car_name || '-'}</td>
                    <td style={{ padding: '11px 14px', color: '#555' }}>{q.start_date ? q.start_date.slice(0, 10) : '-'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: `${status.color}20`, color: status.color, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#777', fontSize: 11 }}>
                      {[q.cover_daemul, q.cover_jacha].filter(Boolean).join(' / ') || '-'}
                    </td>
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditId(q.id); setShowForm(true); }}
                        style={{ marginRight: 6, padding: '4px 10px', background: '#eef2ff', color: '#6c63ff', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteQuote(q.id)}
                        style={{ padding: '4px 10px', background: '#fff0f0', color: '#e74c3c', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                background: p === page ? '#6c63ff' : '#f5f5f5',
                color: p === page ? '#fff' : '#555',
                border: p === page ? 'none' : '1px solid #ddd',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: '#aaa', textAlign: 'right' }}>
        총 {total.toLocaleString()}건
      </div>
    </div>
  );
}
