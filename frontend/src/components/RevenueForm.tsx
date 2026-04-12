import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

interface Props { item: any | null; onSave: (data: any) => void; onClose: () => void; }

export default function RevenueForm({ item, onSave, onClose }: Props) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const now = new Date();
  const [form, setForm] = useState({
    contract_id: item?.contract_id || '', agent_id: item?.agent_id || '',
    revenue_type: item?.revenue_type || 'commission', amount: item?.amount || '',
    commission_rate: item?.commission_rate || '', payment_status: item?.payment_status || 'pending',
    payment_date: item?.payment_date?.split('T')[0] || '',
    period_year: item?.period_year || now.getFullYear(),
    period_month: item?.period_month || (now.getMonth() + 1), memo: item?.memo || '',
  });

  useEffect(() => {
    apiGet('/contracts?limit=100&status=contract').then(d => setContracts(d.data)).catch(() => {});
    apiGet('/agents/all').then(d => setAgents(d)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      contract_id: form.contract_id ? Number(form.contract_id) : null,
      agent_id: form.agent_id ? Number(form.agent_id) : null,
      amount: form.amount ? Number(form.amount) : 0,
      commission_rate: form.commission_rate ? Number(form.commission_rate) : 0,
      period_year: Number(form.period_year), period_month: Number(form.period_month),
      payment_date: form.payment_date || null,
    });
  };

  const st = {
    overlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 16, width: 520, maxHeight: '90vh', overflow: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    header: { padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 700 as const, color: '#1a1a2e' },
    closeBtn: { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999' },
    body: { padding: '20px 24px' },
    row: { display: 'flex' as const, gap: 12, marginBottom: 16 },
    field: { flex: 1 },
    label: { display: 'block', fontSize: 13, fontWeight: 600 as const, color: '#555', marginBottom: 6 },
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
          <span style={st.title}>{item ? '정산 수정' : '정산 등록'}</span>
          <button style={st.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={st.body}>
            <div style={st.section}>연결 정보</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>계약 선택</label>
                <select style={st.select} name="contract_id" value={form.contract_id} onChange={handleChange}>
                  <option value="">-- 계약 선택 --</option>
                  {contracts.map(c => (<option key={c.id} value={c.id}>{c.customer_name} - {c.insurance_company} ({c.car_number})</option>))}
                </select></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>설계사</label>
                <select style={st.select} name="agent_id" value={form.agent_id} onChange={handleChange}>
                  <option value="">-- 설계사 선택 --</option>
                  {agents.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.position})</option>))}
                </select></div>
            </div>

            <div style={st.section}>정산 정보</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>유형</label>
                <select style={st.select} name="revenue_type" value={form.revenue_type} onChange={handleChange}>
                  <option value="commission">수수료</option><option value="bonus">보너스</option><option value="penalty">패널티</option>
                </select></div>
              <div style={st.field}><label style={st.label}>금액 (원)</label>
                <input style={st.input} name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0" /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>수수료율 (%)</label>
                <input style={st.input} name="commission_rate" type="number" step="0.01" value={form.commission_rate} onChange={handleChange} placeholder="0.00" /></div>
              <div style={st.field}><label style={st.label}>지급 상태</label>
                <select style={st.select} name="payment_status" value={form.payment_status} onChange={handleChange}>
                  <option value="pending">대기</option><option value="paid">지급완료</option><option value="cancelled">취소</option>
                </select></div>
            </div>

            <div style={st.section}>정산 기간</div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>정산 연도</label>
                <input style={st.input} name="period_year" type="number" value={form.period_year} onChange={handleChange} /></div>
              <div style={st.field}><label style={st.label}>정산 월</label>
                <select style={st.select} name="period_month" value={form.period_month} onChange={handleChange}>
                  {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}월</option>)}
                </select></div>
              <div style={st.field}><label style={st.label}>지급일</label>
                <input style={st.input} name="payment_date" type="date" value={form.payment_date} onChange={handleChange} /></div>
            </div>

            <div style={{ marginBottom: 8 }}><label style={st.label}>메모</label>
              <textarea style={st.textarea} name="memo" value={form.memo} onChange={handleChange} placeholder="메모..." /></div>
          </div>
          <div style={st.footer}>
            <button type="button" style={st.btnCancel} onClick={onClose}>취소</button>
            <button type="submit" style={st.btnSave}>{item ? '수정' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
