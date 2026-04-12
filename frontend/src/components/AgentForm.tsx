import React, { useState } from 'react';

interface Props { agent: any | null; onSave: (data: any) => void; onClose: () => void; }

export default function AgentForm({ agent, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: agent?.name || '', phone: agent?.phone || '', email: agent?.email || '',
    position: agent?.position || 'agent', status: agent?.status || 'active',
    hire_date: agent?.hire_date?.split('T')[0] || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('이름을 입력해주세요'); return; }
    onSave({ ...form, hire_date: form.hire_date || null });
  };

  const st = {
    overlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 16, width: 480, maxHeight: '90vh', overflow: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
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
    footer: { padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 },
    btnCancel: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer' },
    btnSave: { padding: '10px 24px', border: 'none', borderRadius: 8, background: '#6c63ff', color: '#fff', fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' },
  };

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.header}>
          <span style={st.title}>{agent ? '설계사 수정' : '설계사 등록'}</span>
          <button style={st.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={st.body}>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>이름<span style={st.req}>*</span></label>
                <input style={st.input} name="name" value={form.name} onChange={handleChange} placeholder="설계사 이름" /></div>
              <div style={st.field}><label style={st.label}>직급</label>
                <select style={st.select} name="position" value={form.position} onChange={handleChange}>
                  <option value="agent">설계사</option><option value="teamlead">팀장</option><option value="manager">관리자</option>
                </select></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>전화번호</label>
                <input style={st.input} name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" /></div>
              <div style={st.field}><label style={st.label}>이메일</label>
                <input style={st.input} name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" /></div>
            </div>
            <div style={st.row}>
              <div style={st.field}><label style={st.label}>상태</label>
                <select style={st.select} name="status" value={form.status} onChange={handleChange}>
                  <option value="active">활동</option><option value="inactive">비활동</option>
                </select></div>
              <div style={st.field}><label style={st.label}>입사일</label>
                <input style={st.input} name="hire_date" type="date" value={form.hire_date} onChange={handleChange} /></div>
            </div>
          </div>
          <div style={st.footer}>
            <button type="button" style={st.btnCancel} onClick={onClose}>취소</button>
            <button type="submit" style={st.btnSave}>{agent ? '수정' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
