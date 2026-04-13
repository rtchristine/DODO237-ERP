// ============================================================
// components/PasteModal.tsx
// 인스나라/아이코원 텍스트 붙여넣기 → 파싱 미리보기 모달
// ============================================================

import React, { useState } from 'react';
import { parseQuoteText } from '../utils/quote-parser';
import { ParseResult } from '../types/parser';

interface Props {
  onApply: (result: ParseResult) => void;
  onClose: () => void;
}

// ── 스타일 상수
const STYLES = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 28,
    width: '90%',
    maxWidth: 640,
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 16, fontWeight: 700 as const },
  closeBtn: {
    background: 'none', border: 'none',
    fontSize: 20, cursor: 'pointer', color: '#666',
  },
  guide: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 1.6 },
  textarea: {
    width: '100%', height: 160, padding: 12,
    border: '2px solid #e0e0e0', borderRadius: 8,
    fontSize: 12, fontFamily: 'monospace' as const,
    boxSizing: 'border-box' as const, resize: 'vertical' as const,
  },
  btnRow: { display: 'flex', gap: 8, marginTop: 12 },
  preview: {
    marginTop: 16, padding: 14,
    background: '#f8f9ff', borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  previewTitle: { fontSize: 12, fontWeight: 700 as const, marginBottom: 8, color: '#6c63ff' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12 },
  infoRow: { display: 'flex', gap: 6 },
  infoKey: { color: '#888', minWidth: 60 },
  infoVal: { fontWeight: 600 as const },
  priceRow: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e0e0e0' },
  priceLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  priceTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  priceTag: {
    background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, padding: '3px 10px', fontSize: 12,
  },
  price: { color: '#e74c3c' },
  covRow: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e0e0e0' },
  covTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  covTag: {
    background: '#eef2ff', color: '#6c63ff',
    padding: '2px 8px', borderRadius: 4, fontSize: 11,
  },
};

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, padding: '10px 0',
        background: disabled ? '#ccc' : '#6c63ff',
        color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SuccessBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 0',
        background: '#27ae60',
        color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function PasteModal({ onApply, onClose }: Props) {
  const [text, setText]         = useState('');
  const [result, setResult]     = useState<ParseResult | null>(null);
  const [parsing, setParsing]   = useState(false);

  // 파싱 실행
  function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    try {
      setResult(parseQuoteText(text));
    } catch {
      alert('파싱 중 오류가 발생했습니다. 텍스트를 확인해주세요.');
    } finally {
      setParsing(false);
    }
  }

  // 폼에 적용
  function handleApply() {
    if (!result) return;
    onApply(result);
    onClose();
  }

  const sourceLabel = result?.source === 'insnara' ? '🟢 인스나라' : '🔵 아이코원';

  // 미리보기 항목 목록
  const PREVIEW_FIELDS: [string, string | undefined][] = result ? [
    ['고객명',   result.info.name],
    ['차량번호', result.info.carno],
    ['차명',     result.info.carname],
    ['연식',     result.info.year],
    ['시작일',   result.info.startDate],
    ['차량가액', result.info.carPrice],
    ['운전범위', result.info.drive],
    ['연령한정', result.info.age],
    ['전가입사', result.info.prev],
    ['할인등급', result.info.discGrade],
  ] : [];

  return (
    <div style={STYLES.overlay}>
      <div style={STYLES.modal}>
        {/* 헤더 */}
        <div style={STYLES.header}>
          <h3 style={STYLES.title}>📋 견적화면 붙여넣기 파싱</h3>
          <button style={STYLES.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 안내 */}
        <p style={STYLES.guide}>
          인스나라 또는 아이코원 견적화면에서{' '}
          <strong>Ctrl+A → Ctrl+C</strong> 후 아래에 붙여넣기 하세요.
        </p>

        {/* 텍스트 입력 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="여기에 붙여넣기 (Ctrl+V / ⌘+V)..."
          style={STYLES.textarea}
        />

        {/* 버튼 */}
        <div style={STYLES.btnRow}>
          <PrimaryBtn onClick={handleParse} disabled={!text.trim() || parsing}>
            {parsing ? '⏳ 파싱 중...' : '🔍 파싱 실행'}
          </PrimaryBtn>
          {result && (
            <SuccessBtn onClick={handleApply}>
              ✅ 폼에 적용
            </SuccessBtn>
          )}
        </div>

        {/* 파싱 결과 미리보기 */}
        {result && (
          <div style={STYLES.preview}>
            <div style={STYLES.previewTitle}>{sourceLabel} 파싱 결과</div>

            {/* 기본 정보 그리드 */}
            <div style={STYLES.infoGrid}>
              {PREVIEW_FIELDS.map(([key, val]) =>
                val ? (
                  <div key={key} style={STYLES.infoRow}>
                    <span style={STYLES.infoKey}>{key}</span>
                    <span style={STYLES.infoVal}>{val}</span>
                  </div>
                ) : null
              )}
            </div>

            {/* 보험료 */}
            {result.insurers.length > 0 && (
              <div style={STYLES.priceRow}>
                <div style={STYLES.priceLabel}>
                  보험료 ({result.insurers.length}개사)
                </div>
                <div style={STYLES.priceTags}>
                  {result.insurers.map(ins => (
                    <span key={ins.id} style={STYLES.priceTag}>
                      {ins.name}{' '}
                      <strong style={STYLES.price}>
                        {ins.off.toLocaleString()}원
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 담보 */}
            {result.coverages.length > 0 && (
              <div style={STYLES.covRow}>
                <div style={STYLES.priceLabel}>담보</div>
                <div style={STYLES.covTags}>
                  {result.coverages.map(c => (
                    <span key={c.key} style={STYLES.covTag}>
                      {c.key}: {c.val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
