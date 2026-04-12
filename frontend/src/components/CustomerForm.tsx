import React, { useState } from 'react';

interface Props { customer: any | null; onSave: (data: any) => void; onClose: () => void; }

export default function CustomerForm({ customer, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: customer?.name || '', phone: customer?.phone || '', car_number: customer?.car_number || '',
    car_model: customer?.car_model || '', car_year: customer?.car_year || '',
    birthdate: customer?.birthdate?.split('T')[0] || '', gender: customer?.gender || '',
    address: customer?.address || '', memo: customer?.memo || '', source: customer?.source || 'direct',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('고객명을 입력해주세요'); return; }
    onSave({ ...form, car_year: form.car_year ? Number(form.car_year) : null, birthdate: form.birthdate || null });
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
    req: { color: '#e53935', marginLeft: 2 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
    textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' as const },
    footer: { padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 },
    btnCancel: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer' },
    btnSave: { padding: '10px 24px', border: 'none', borderRadius: 8, background: '#6c63ff', color: '#fff', fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' },
  };

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.header}>
          <span style={st.title}>{customer ? '고객 수정' : '고객 등록'}</span>
          <button style={st.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={st.body}>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>고객명<span style={st.req}>*</span></label>
                <input style={st.input} name="name" value={form.name} onChange={handleChange} placeholder="고객명" /></div>
              <div style={st.field}><label style={st.label}>전화번호</label>
                <input style={st.input} name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>차량번호</label>
                <input style={st.input} name="car_number" value={form.car_number} onChange={handleChange} placeholder="12가3456" /></div>
              <div style={st.field}><label style={st.label}>차종</label>
                <input style={st.input} name="car_model" value={form.car_model} onChange={handleChange} placeholder="쏘나타" /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>연식</label>
                <input style={st.input} name="car_year" type="number" value={form.car_year} onChange={handleChange} placeholder="2024" /></div>
              <div style={st.field}><label style={st.label}>생년월일</label>
                <input style={st.input} name="birthdate" type="date" value={form.birthdate} onChange={handleChange} /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>성별</label>
                <select style={st.select} name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">선택</option><option value="M">남성</option><option value="F">여성</option>
                </select></div>
              <div style={st.field}><label style={st.label}>유입경로</label>
                <select style={st.select} name="source" value={form.source} onChange={handleChange}>
                  <option value="direct">직접</option><option value="referral">소개</option><option value="ad">광고</option>
                </select></div>
            </div>
            <div style={{ marginBottom: 16 }}><label style={st.label}>주소</label>
              <input style={st.input} name="address" value={form.address} onChange={handleChange} placeholder="주소" /></div>
            <div style={{ marginBottom: 8 }}><label style={st.label}>메모</label>
              <textarea style={st.textarea} name="memo" value={form.memo} onChange={handleChange} placeholder="메모..." /></div>
          </div>
          <div style={st.footer}>
            <button type="button" style={st.btnCancel} onClick={onClose}>취소</button>
            <button type="submit" style={st.btnSave}>{customer ? '수정' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
