// ============================================================
// components/QuoteForm.tsx
// 견적 입력 / 수정 폼 (UI 렌더링 전담)
// 로직은 hooks/useQuoteForm.ts 참조
// ============================================================

import React, { useState } from 'react';
import { useQuoteForm }   from '../hooks/useQuoteForm';
import { useAgents }      from '../hooks/useAgents';
import PasteModal         from './PasteModal';
import RateTable          from './RateTable';
import KakaoText          from './KakaoText';
import {
  INSURER_LIST, DRIVE_RANGE_OPTIONS, AGE_LIMIT_OPTIONS,
  DAEMUL_OPTIONS, EMERGENCY_OPTIONS, PAY_METHOD_OPTIONS,
} from '../constants/insurance';

// ── 공통 스타일
const S = {
  card: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 16,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 14, fontWeight: 700, color: '#6c63ff',
    borderBottom: '2px solid #6c63ff', paddingBottom: 6, marginBottom: 16,
  } as React.CSSProperties,
  row2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12,
  } as React.CSSProperties,
  row3: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12,
  } as React.CSSProperties,
  label: {
    fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 4, display: 'block',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '8px 10px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 13, boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

interface Props {
  quoteId: number | null;
  onClose: (saved?: boolean) => void;
}

export default function QuoteForm({ quoteId, onClose }: Props) {
  const { form, insurers, loading, saving, setField, applyParsed, save } = useQuoteForm(quoteId);
  const { agents } = useAgents();
  const [showPaste, setShowPaste] = useState(false);

  // 저장 후 목록으로 복귀
  async function handleSave() {
    const ok = await save();
    if (ok) onClose(true);
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>⏳ 불러오는 중...</div>;
  }

  return (
    <>
      {/* 붙여넣기 파싱 모달 */}
      {showPaste && (
        <PasteModal
          onApply={applyParsed}
          onClose={() => setShowPaste(false)}
        />
      )}

      <div style={{ maxWidth: 800 }}>
        {/* 상단 액션 버튼 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPaste(true)}
            style={{
              padding: '10px 20px', background: '#f39c12',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📋 붙여넣기 자동 입력
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: saving ? '#aaa' : '#6c63ff',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '저장 중...' : quoteId ? '✏️ 수정 저장' : '💾 저장'}
          </button>
          <button
            onClick={() => onClose()}
            style={{
              padding: '10px 20px', background: '#f5f5f5',
              color: '#555', border: '1px solid #ddd',
              borderRadius: 8, fontSize: 14, cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>

        {/* ── 보험료 비교표 (파싱 후 표시) */}
        <RateTable insurers={insurers} />

        {/* ── 카카오톡 전송 텍스트 생성 */}
        <KakaoText form={form} insurers={insurers} />

        {/* ── 섹션 1: 차량 / 피보험자 */}
        <div style={S.card}>
          <div style={S.sectionTitle}>🚗 차량 / 피보험자 정보</div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>피보험자명</label>
              <input style={S.input} value={form.insuredName} onChange={setField('insuredName')} placeholder="홍길동" />
            </div>
            <div>
              <label style={S.label}>차량번호</label>
              <input style={S.input} value={form.carno} onChange={setField('carno')} placeholder="12가3456" />
            </div>
          </div>
          <div style={S.row3}>
            <div>
              <label style={S.label}>차명</label>
              <input style={S.input} value={form.carname} onChange={setField('carname')} placeholder="쏘나타" />
            </div>
            <div>
              <label style={S.label}>연식</label>
              <input style={S.input} value={form.carYear} onChange={setField('carYear')} placeholder="2022" />
            </div>
            <div>
              <label style={S.label}>차량가액</label>
              <input style={S.input} value={form.carPrice} onChange={setField('carPrice')} placeholder="2000만원" />
            </div>
          </div>
          <div>
            <label style={S.label}>담당 설계사</label>
            <select style={{ ...S.input, maxWidth: 240 }} value={form.agentId} onChange={setField('agentId')}>
              <option value="">-- 선택 --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 섹션 2: 보험 조건 */}
        <div style={S.card}>
          <div style={S.sectionTitle}>📅 보험 조건</div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>보험시작일</label>
              <input type="date" style={S.input} value={form.startDate} onChange={setField('startDate')} />
            </div>
            <div>
              <label style={S.label}>보험종료일</label>
              <input type="date" style={S.input} value={form.endDate} onChange={setField('endDate')} />
            </div>
          </div>
          <div style={S.row3}>
            <div>
              <label style={S.label}>용도</label>
              <select style={S.input} value={form.usageType} onChange={setField('usageType')}>
                <option value="">선택</option>
                <option>개인용</option>
                <option>업무용</option>
              </select>
            </div>
            <div>
              <label style={S.label}>운전범위</label>
              <select style={S.input} value={form.driveRange} onChange={setField('driveRange')}>
                <option value="">선택</option>
                {DRIVE_RANGE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>연령한정</label>
              <select style={S.input} value={form.ageLimit} onChange={setField('ageLimit')}>
                <option value="">선택</option>
                {AGE_LIMIT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={S.row3}>
            <div>
              <label style={S.label}>전가입사</label>
              <select style={S.input} value={form.prevInsurer} onChange={setField('prevInsurer')}>
                <option value="">선택</option>
                {INSURER_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>할인할증등급</label>
              <input style={S.input} value={form.discGrade} onChange={setField('discGrade')} placeholder="예) 3F, 5Z" />
            </div>
            <div>
              <label style={S.label}>납입방법</label>
              <select style={S.input} value={form.payMethod} onChange={setField('payMethod')}>
                <option value="">선택</option>
                {PAY_METHOD_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={S.label}>할인특약</label>
            <input
              style={S.input}
              value={form.specialDiscounts}
              onChange={setField('specialDiscounts')}
              placeholder="블랙박스할인, T-map 할인, 마일리지 후할인..."
            />
          </div>
        </div>

        {/* ── 섹션 3: 담보 */}
        <div style={S.card}>
          <div style={S.sectionTitle}>🛡️ 담보 내용</div>
          <div style={S.row3}>
            <div>
              <label style={S.label}>대인II</label>
              <select style={S.input} value={form.coverDaeinII} onChange={setField('coverDaeinII')}>
                <option>무한</option>
                <option>미가입</option>
              </select>
            </div>
            <div>
              <label style={S.label}>대물</label>
              <select style={S.input} value={form.coverDaemul} onChange={setField('coverDaemul')}>
                {DAEMUL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>자상</label>
              <input style={S.input} value={form.coverJasang} onChange={setField('coverJasang')} placeholder="예) 3억/5천" />
            </div>
          </div>
          <div style={S.row3}>
            <div>
              <label style={S.label}>무보험</label>
              <select style={S.input} value={form.coverMuboheom} onChange={setField('coverMuboheom')}>
                <option value="">미가입</option>
                <option>2억원</option>
                <option>5억원</option>
              </select>
            </div>
            <div>
              <label style={S.label}>자기차량</label>
              <select style={S.input} value={form.coverJacha} onChange={setField('coverJacha')}>
                <option>가입</option>
                <option>미가입</option>
              </select>
            </div>
            <div>
              <label style={S.label}>긴급출동</label>
              <select style={S.input} value={form.coverEmergency} onChange={setField('coverEmergency')}>
                <option value="">선택</option>
                {EMERGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── 섹션 4: 메모 */}
        <div style={S.card}>
          <div style={S.sectionTitle}>📝 메모</div>
          <textarea
            value={form.memo}
            onChange={setField('memo')}
            placeholder="특이사항, 고객 요청사항 등..."
            style={{ ...S.input, height: 80, resize: 'vertical' }}
          />
        </div>

        {/* 하단 저장 버튼 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => onClose()}
            style={{
              padding: '10px 24px', background: '#f5f5f5',
              color: '#555', border: '1px solid #ddd',
              borderRadius: 8, fontSize: 14, cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: saving ? '#aaa' : '#6c63ff',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '저장 중...' : quoteId ? '✏️ 수정 저장' : '💾 저장'}
          </button>
        </div>
      </div>
    </>
  );
}
