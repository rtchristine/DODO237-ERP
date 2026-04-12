import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import AgentForm from '../components/AgentForm';

interface Agent {
  id: number; name: string; phone: string; email: string; position: string;
  status: string; hire_date: string; customer_count: number; contract_count: number; created_at: string;
}

const positionLabel: Record<string, string> = { agent: '설계사', teamlead: '팀장', manager: '관리자' };
const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: '활동', bg: '#e8f5e9', color: '#2e7d32' },
  inactive: { label: '비활동', bg: '#f5f5f5', color: '#999' },
};

export default function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(page)); params.append('limit', '20');
      const data = await apiGet(`/agents?${params}`);
      setAgents(data.data); setTotal(data.total);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchAgents(); };

  const handleSave = async (data: any) => {
    try {
      if (editAgent) { await apiPut(`/agents/${editAgent.id}`, data); }
      else { await apiPost('/agents', data); }
      setShowForm(false); setEditAgent(null); fetchAgents();
    } catch (err) { alert('저장 실패'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 설계사를 삭제하시겠습니까?`)) return;
    try { await apiDelete(`/agents/${id}`); fetchAgents(); } catch (err) { alert('삭제 실패'); }
  };

  const s = {
    card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' as const },
    topBar: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 20, gap: 12, flexWrap: 'wrap' as const },
    searchBox: { display: 'flex' as const, gap: 8 },
    input: { padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', width: 260 },
    btnPrimary: { padding: '10px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' },
    btnSearch: { padding: '10px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 14 },
    th: { padding: '12px 16px', textAlign: 'left' as const, background: '#f8f8fa', color: '#666', fontWeight: 600 as const, fontSize: 13, borderBottom: '2px solid #eee' },
    td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
    badge: (bg: string, color: string) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 as const, background: bg, color }),
    actionBtn: { padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, marginRight: 4 },
    empty: { padding: 60, textAlign: 'center' as const, color: '#aaa', fontSize: 15 },
    stat: { display: 'flex' as const, gap: 16, marginBottom: 20 },
    statCard: (c: string) => ({ flex: 1, padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c}` }),
  };

  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <div>
      <div style={s.stat}>
        <div style={s.statCard('#6c63ff')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>전체 설계사</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{total}</div>
        </div>
        <div style={s.statCard('#00c853')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>활동 중</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{activeCount}</div>
        </div>
        <div style={s.statCard('#ff6b6b')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>비활동</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{total - activeCount}</div>
        </div>
      </div>

      <div style={s.topBar}>
        <form onSubmit={handleSearch} style={s.searchBox}>
          <input style={s.input} placeholder="이름, 전화번호, 이메일로 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" style={s.btnSearch}>검색</button>
        </form>
        <button style={s.btnPrimary} onClick={() => { setEditAgent(null); setShowForm(true); }}>+ 설계사 등록</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>번호</th><th style={s.th}>이름</th><th style={s.th}>직급</th>
            <th style={s.th}>전화번호</th><th style={s.th}>이메일</th><th style={s.th}>담당 고객</th>
            <th style={s.th}>계약 건수</th><th style={s.th}>상태</th><th style={s.th}>입사일</th><th style={s.th}>관리</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={s.empty}>불러오는 중...</td></tr>
            ) : agents.length === 0 ? (
              <tr><td colSpan={10} style={s.empty}>"+ 설계사 등록" 버튼을 눌러 첫 설계사를 등록하세요!</td></tr>
            ) : (
              agents.map((a, i) => {
                const st = statusStyle[a.status] || statusStyle.active;
                return (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={s.td}>{a.id}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{a.name}</td>
                    <td style={s.td}><span style={s.badge('#e8eaf6', '#283593')}>{positionLabel[a.position] || a.position}</span></td>
                    <td style={s.td}>{a.phone || '-'}</td>
                    <td style={{ ...s.td, fontSize: 13 }}>{a.email || '-'}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontWeight: 600 }}>{a.customer_count || 0}명</td>
                    <td style={{ ...s.td, textAlign: 'center', fontWeight: 600 }}>{a.contract_count || 0}건</td>
                    <td style={s.td}><span style={s.badge(st.bg, st.color)}>{st.label}</span></td>
                    <td style={{ ...s.td, fontSize: 13, color: '#888' }}>{a.hire_date ? new Date(a.hire_date).toLocaleDateString('ko-KR') : '-'}</td>
                    <td style={s.td}>
                      <button style={s.actionBtn} onClick={() => { setEditAgent(a); setShowForm(true); }}>수정</button>
                      <button style={{ ...s.actionBtn, color: '#e53935', borderColor: '#ffcdd2' }} onClick={() => handleDelete(a.id, a.name)}>삭제</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <AgentForm agent={editAgent} onSave={handleSave} onClose={() => { setShowForm(false); setEditAgent(null); }} />}
    </div>
  );
}
