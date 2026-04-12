import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

interface Props { contract: any | null; onSave: (data: any) => void; onClose: () => void; }

export default function ContractForm({ contract, onSave, onClose }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_id: contract?.customer_id || '', quote_type: contract?.quote_type || 'CM',
    insurance_company: contract?.insurance_company || '', premium: contract?.premium || '',
    discount_rate: contract?.discount_rate || '', coverage_type: contract?.coverage_type || 'basic',
    driver_range: contract?.driver_range || '', age_range: contract?.age_range || '',
    insurance_period: contract?.insurance_period || '', previous_company: contract?.previous_company || '',
    status: contract?.status || 'quote', contract_date: contract?.contract_date?.split('T')[0] || '',
    start_date: contract?.start_date?.split('T')[0] || '', end_date: contract?.end_date?.split('T')[0] || '',
    memo: contract?.memo || '',
  });

  useEffect(() => { apiGet('/customers?limit=100').then(data => setCustomers(data.data)).catch(() => {}); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id) { alert('고객을 선택해주세요'); return; }
    onSave({
      ...form, customer_id: Number(form.customer_id),
      premium: form.premium ? Number(form.premium) : 0,
      discount_rate: form.discount_rate ? Number(form.discount_rate) : 0,
      contract_date: form.contract_date || null, start_date: form.start_date || null, end_date: form.end_date || null,
    });
  };

  const insurers = ['삼성화재', '현대해상', 'DB손해보험', 'KB손해보험', '메리츠화재', '한화손해보험', '롯데손해보험', 'MG손해보험', '흥국화재', '캐롯손해보험', '하나손해보험'];

  const st = {
    overlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 16, width: 580, maxHeight: '90vh', overflow: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    header: { padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 700 as const, color: '#1a1a2e' },
    closeBtn: { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999' },
    body: { padding: '20px 24px' },
    row: { display: 'flex' as const, gap: 12, marginBottom: 16 },
    field: { flex: 1 },
    label: { display: 'block', fontSize: 13, fontWeight: 600 as const, color: '#555', marginBottom: 6 },
    req: { color: '#e53935', marginLeft: 2 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
    textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', minHeight: 70, resize: 'vertical' as const },
    section: { fontSize: 14, fontWeight: 600 as const, color: '#6c63ff', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #eee' },
    footer: { padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 },
    btnCancel: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer' },
    btnSave: { padding: '10px 24px', border: 'none', borderRadius: 8, background: '#6c63ff', color: '#fff', fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' },
  };

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.header}>
          <span style={st.title}>{contract ? '견적/계약 수정' : '견적 등록'}</span>
          <button style={st.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={st.body}>
            <div style={st.section}>고객 정보</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>고객 선택<span style={st.req}>*</span></label>
                <select style={st.select} name="customer_id" value={form.customer_id} onChange={handleChange}>
                  <option value="">-- 고객을 선택하세요 --</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.car_number || '차량 없음'})</option>))}
                </select></div>
            </div>

            <div style={st.section}>견적 정보</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>가입유형</label>
                <select style={st.select} name="quote_type" value={form.quote_type} onChange={handleChange}>
                  <option value="CM">CM 다이렉트</option><option value="TM">TM 전화가입</option><option value="offline">오프라인(대리점)</option>
                </select></div>
              <div style={st.field}><label style={st.label}>보험사</label>
                <select style={st.select} name="insurance_company" value={form.insurance_company} onChange={handleChange}>
                  <option value="">-- 선택 --</option>
                  {insurers.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                </select></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>보험료</label>
                <input style={st.input} name="premium" type="number" value={form.premium} onChange={handleChange} placeholder="0" /></div>
              <div style={st.field}><label style={st.label}>할인율 (%)</label>
                <input style={st.input} name="discount_rate" type="number" step="0.01" value={form.discount_rate} onChange={handleChange} placeholder="0.00" /></div>
            </div>

            <div style={st.section}>보장 내용</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>보장유형</label>
                <select style={st.select} name="coverage_type" value={form.coverage_type} onChange={handleChange}>
                  <option value="basic">기본</option><option value="premium">최고</option><option value="liability">책임</option>
                </select></div>
              <div style={st.field}><label style={st.label}>전 가입사</label>
                <input style={st.input} name="previous_company" value={form.previous_company} onChange={handleChange} placeholder="전 가입 보험사" /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>운전범위</label>
                <input style={st.input} name="driver_range" value={form.driver_range} onChange={handleChange} placeholder="예: 가족한정" /></div>
              <div style={st.field}><label style={st.label}>연령범위</label>
                <input style={st.input} name="age_range" value={form.age_range} onChange={handleChange} placeholder="예: 만26세 이상" /></div>
            </div>

            <div style={st.section}>기간 및 상태</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>보험기간</label>
                <input style={st.input} name="insurance_period" value={form.insurance_period} onChange={handleChange} placeholder="예: 1년" /></div>
              <div style={st.field}><label style={st.label}>상태</label>
                <select style={st.select} name="status" value={form.status} onChange={handleChange}>
                  <option value="quote">견적</option><option value="contract">계약</option>
                  <option value="cancelled">해지</option><option value="expired">만기</option>
                </select></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>보험 시작일</label>
                <input style={st.input} name="start_date" type="date" value={form.start_date} onChange={handleChange} /></div>
              <div style={st.field}><label style={st.label}>보험 종료일</label>
                <input style={st.input} name="end_date" type="date" value={form.end_date} onChange={handleChange} /></div>
            </div>

            <div style={{ marginBottom: 8 }}><label style={st.label}>메모</label>
              <textarea style={st.textarea} name="memo" value={form.memo} onChange={handleChange} placeholder="메모..." /></div>
          </div>
          <div style={st.footer}>
            <button type="button" style={st.btnCancel} onClick={onClose}>취소</button>
            <button type="submit" style={st.btnSave}>{contract ? '수정' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
