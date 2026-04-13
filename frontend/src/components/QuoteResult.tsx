import React from 'react';

interface ResultItem {
  name: string;
  cm: number;
  off: number;
  [key: string]: any;
}

interface QuoteResultProps {
  results: ResultItem[];
  onClose: () => void;
  onSave: (results: ResultItem[]) => void;
  saving?: boolean;
}

const fmt = (n: number) => {
  if (!n || n <= 0) return '-';
  return n.toLocaleString() + '원';
};

const companyColors: Record<string, { bg: string; color: string; border: string }> = {
  '삼성화재': { bg: '#e8f4fd', color: '#0b5394', border: '#0b5394' },
  'DB손보': { bg: '#e8f5e9', color: '#2e7d32', border: '#2e7d32' },
  'KB손보': { bg: '#fff8e1', color: '#f57f17', border: '#f57f17' },
  '현대해상': { bg: '#fce4ec', color: '#c62828', border: '#c62828' },
  '메리츠화재': { bg: '#f3e5f5', color: '#6a1b9a', border: '#6a1b9a' },
  '한화손보': { bg: '#fff3e0', color: '#e65100', border: '#e65100' },
  '롯데손보': { bg: '#ffebee', color: '#b71c1c', border: '#b71c1c' },
  'MG손보': { bg: '#e0f2f1', color: '#00695c', border: '#00695c' },
  '흥국화재': { bg: '#fbe9e7', color: '#bf360c', border: '#bf360c' },
  'AXA손보': { bg: '#e3f2fd', color: '#1565c0', border: '#1565c0' },
  '캐롯손보': { bg: '#f1f8e9', color: '#558b2f', border: '#558b2f' },
  '하나손보': { bg: '#e8eaf6', color: '#283593', border: '#283593' },
};

const getCompanyStyle = (name: string) => {
  return companyColors[name] || { bg: '#f5f5f5', color: '#555', border: '#999' };
};

function QuoteResult({ results, onClose, onSave, saving }: QuoteResultProps) {
  if (!results || results.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 16, color: '#888', marginBottom: 20 }}>산출 결과가 없습니다</div>
        <button onClick={onClose} style={{ padding: '8px 24px', background: '#f0f0f0', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>돌아가기</button>
      </div>
    );
  }

  const validResults = results.filter(r => (r.cm > 0 || r.off > 0));
  const invalidResults = results.filter(r => r.cm <= 0 && r.off <= 0);

  const getPrice = (r: ResultItem) => {
    if (r.off > 0) return r.off;
    if (r.cm > 0) return r.cm;
    return Infinity;
  };
  const sortedResults = [...validResults].sort((a, b) => getPrice(a) - getPrice(b));
  const lowestPrice = sortedResults.length > 0 ? getPrice(sortedResults[0]) : 0;

  const getDiff = (r: ResultItem) => {
    if (r.cm > 0 && r.off > 0) return r.cm - r.off;
    return 0;
  };

  return (
    <div>
      {/* 상단 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '14px 16px', borderLeft: '4px solid #6c63ff' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>📊 산출 보험사</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6c63ff' }}>{results.length}개사</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '14px 16px', borderLeft: '4px solid #27ae60' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>✅ 산출 성공</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#27ae60' }}>{validResults.length}개사</div>
        </div>
        {sortedResults.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '14px 16px', borderLeft: '4px solid #e74c3c' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>🏆 최저 보험료</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>{fmt(lowestPrice)}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>{sortedResults[0].name}</div>
          </div>
        )}
      </div>

      {/* 보험사별 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        {sortedResults.map((r, i) => {
          const cs = getCompanyStyle(r.name);
          const isLowest = getPrice(r) === lowestPrice;
          const diff = getDiff(r);
          return (
            <div key={r.name + i} style={{
              background: '#fff', borderRadius: 10,
              border: isLowest ? `2px solid ${cs.border}` : '1px solid #eee',
              padding: '16px 18px', position: 'relative',
              boxShadow: isLowest ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
            }}>
              {i < 3 && (
                <div style={{
                  position: 'absolute', top: -8, right: 12,
                  background: i === 0 ? '#e74c3c' : i === 1 ? '#f39c12' : '#95a5a6',
                  color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                }}>{i === 0 ? '최저가' : `${i + 1}위`}</div>
              )}
              <div style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 6,
                fontSize: 13, fontWeight: 700, marginBottom: 12, background: cs.bg, color: cs.color,
              }}>{r.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.off > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#888' }}>할인(OFF)</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: isLowest ? '#e74c3c' : '#1a1a2e' }}>{fmt(r.off)}</span>
                  </div>
                )}
                {r.cm > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#888' }}>정상(CM)</span>
                    <span style={{ fontSize: 16, color: '#888', textDecoration: r.off > 0 ? 'line-through' : 'none' }}>{fmt(r.cm)}</span>
                  </div>
                )}
                {diff > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed #eee' }}>
                    <span style={{ fontSize: 11, color: '#27ae60' }}>할인 금액</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#27ae60' }}>-{fmt(diff)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 산출 실패 보험사 */}
      {invalidResults.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>⚠️ 산출 불가 보험사</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {invalidResults.map((r, i) => (
              <span key={r.name + i} style={{ padding: '3px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 12, color: '#999' }}>{r.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* 비교 테이블 */}
      {sortedResults.length > 1 && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '16px 18px', marginBottom: 16, overflowX: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>📋 보험료 비교표</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#888', fontWeight: 500 }}>순위</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#888', fontWeight: 500 }}>보험사</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#888', fontWeight: 500 }}>할인(OFF)</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#888', fontWeight: 500 }}>정상(CM)</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#888', fontWeight: 500 }}>할인액</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#888', fontWeight: 500 }}>최저가 대비</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => {
                const priceDiffFromLowest = getPrice(r) - lowestPrice;
                return (
                  <tr key={r.name + i} style={{ borderBottom: '1px solid #f0f0f0', background: i === 0 ? '#fff9f9' : 'transparent' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: i === 0 ? '#e74c3c' : '#aaa' }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#e74c3c' : '#333' }}>{fmt(r.off)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#888' }}>{fmt(r.cm)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#27ae60' }}>{getDiff(r) > 0 ? `-${fmt(getDiff(r))}` : '-'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: priceDiffFromLowest > 0 ? '#e67e22' : '#27ae60' }}>{priceDiffFromLowest > 0 ? `+${fmt(priceDiffFromLowest)}` : '최저'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onClose} style={{ padding: '10px 24px', background: '#f0f0f0', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>← 입력으로 돌아가기</button>
        <button onClick={() => onSave(results)} disabled={saving} style={{
          padding: '10px 30px', background: '#6c63ff', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1,
        }}>{saving ? '저장중...' : '💾 산출 결과 저장'}</button>
      </div>
    </div>
  );
}

export default QuoteResult;
