import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import CustomerForm from '../components/CustomerForm';

interface Customer {
  id: number; name: string; phone: string; car_number: string; car_model: string;
  car_year: number; birthdate: string; gender: string; address: string; memo: string;
  agent_id: number; agent_name: string; source: string; created_at: string;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(page));
      params.append('limit', '20');
      const data = await apiGet(`/customers?${params}`);
      setCustomers(data.data);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCustomers(); };

  const handleSave = async (data: any) => {
    try {
      if (editCustomer) { await apiPut(`/customers/${editCustomer.id}`, data); }
      else { await apiPost('/customers', data); }
      setShowForm(false); setEditCustomer(null); fetchCustomers();
    } catch (err) { alert('저장 실패'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 고객을 삭제하시겠습니까?`)) return;
    try { await apiDelete(`/customers/${id}`); fetchCustomers(); }
    catch (err) { alert('삭제 실패'); }
  };

  const sourceLabel: Record<string, string> = { direct: '직접', referral: '소개', ad: '광고' };

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
    badge: (type: string) => ({
      display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 as const,
      background: type === 'direct' ? '#e8f5e9' : type === 'referral' ? '#fff3e0' : '#e3f2fd',
      color: type === 'direct' ? '#2e7d32' : type === 'referral' ? '#ef6c00' : '#1565c0',
    }),
    actionBtn: { padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, marginRight: 4 },
    empty: { padding: 60, textAlign: 'center' as const, color: '#aaa', fontSize: 15 },
    stat: { display: 'flex' as const, gap: 16, marginBottom: 20 },
    statCard: (color: string) => ({ flex: 1, padding: '20px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }),
    pagination: { display: 'flex' as const, justifyContent: 'center' as const, alignItems: 'center' as const, gap: 12, padding: '16px 0' },
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={s.stat}>
        <div style={s.statCard('#6c63ff')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>전체 고객 수</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{total}</div>
        </div>
        <div style={s.statCard('#00c853')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>오늘 등록</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
            {customers.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div style={s.statCard('#ff6b6b')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>현재 페이지</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{page} / {totalPages || 1}</div>
        </div>
      </div>

      <div style={s.topBar}>
        <form onSubmit={handleSearch} style={s.searchBox}>
          <input style={s.input} placeholder="이름, 전화번호, 차량번호로 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" style={s.btnSearch}>검색</button>
        </form>
        <button style={s.btnPrimary} onClick={() => { setEditCustomer(null); setShowForm(true); }}>+ 고객 등록</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>번호</th><th style={s.th}>이름</th><th style={s.th}>전화번호</th>
              <th style={s.th}>차량번호</th><th style={s.th}>차종</th><th style={s.th}>유입경로</th>
              <th style={s.th}>등록일</th><th style={s.th}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={s.empty}>불러오는 중...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={8} style={s.empty}>"+ 고객 등록" 버튼을 눌러 첫 고객을 등록하세요!</td></tr>
            ) : (
              customers.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>{c.id}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{c.name}</td>
                  <td style={s.td}>{c.phone || '-'}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}>{c.car_number || '-'}</td>
                  <td style={s.td}>{c.car_model || '-'}</td>
                  <td style={s.td}><span style={s.badge(c.source || 'direct')}>{sourceLabel[c.source] || '직접'}</span></td>
                  <td style={{ ...s.td, fontSize: 13, color: '#888' }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</td>
                  <td style={s.td}>
                    <button style={s.actionBtn} onClick={() => { setEditCustomer(c); setShowForm(true); }}>수정</button>
                    <button style={{ ...s.actionBtn, color: '#e53935', borderColor: '#ffcdd2' }} onClick={() => handleDelete(c.id, c.name)}>삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={s.pagination}>
            <button style={{ ...s.actionBtn, padding: '6px 12px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
            <span style={{ fontSize: 14, color: '#666' }}>{page} / {totalPages}</span>
            <button style={{ ...s.actionBtn, padding: '6px 12px' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>다음</button>
          </div>
        )}
      </div>

      {showForm && <CustomerForm customer={editCustomer} onSave={handleSave} onClose={() => { setShowForm(false); setEditCustomer(null); }} />}
    </div>
  );
}
