import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import RevenueForm from '../components/RevenueForm';

interface Revenue {
  id: number; contract_id: number; agent_id: number; agent_name: string;
  customer_name: string; car_number: string; insurance_company: string; premium: number;
  revenue_type: string; amount: number; commission_rate: number;
  payment_status: string; payment_date: string; period_year: number; period_month: number;
  memo: string; created_at: string;
}

interface Stats { total_paid: number; total_pending: number; paid_count: number; pending_count: number; monthly_paid: number; }

const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: '대기', bg: '#fff3e0', color: '#e65100' },
  paid: { label: '지급완료', bg: '#e8f5e9', color: '#2e7d32' },
  cancelled: { label: '취소', bg: '#fce4ec', color: '#c62828' },
};

const typeLabel: Record<string, string> = { commission: '수수료', bonus: '보너스', penalty: '패널티' };

export default function RevenueList() {
  const [items, setItems] = useState<Revenue[]>([]);
  const [stats, setStats] = useState<Stats>({ total_paid: 0, total_pending: 0, paid_count: 0, pending_count: 0, monthly_paid: 0 });
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Revenue | null>(null);

  const now = new Date();
  const [filterYear] = useState(now.getFullYear());
  const [filterMonth] = useState(now.getMonth() + 1);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('payment_status', statusFilter);
      params.append('page', String(page)); params.append('limit', '20');
      const data = await apiGet(`/revenue?${params}`);
      setItems(data.data); setTotal(data.total);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try { const data = await apiGet(`/revenue/stats?period_year=${filterYear}&period_month=${filterMonth}`); setStats(data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); fetchStats(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchItems(); };

  const handleSave = async (data: any) => {
    try {
      if (editItem) { await apiPut(`/revenue/${editItem.id}`, data); }
      else { await apiPost('/revenue', data); }
      setShowForm(false); setEditItem(null); fetchItems(); fetchStats();
    } catch (err) { alert('저장 실패'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 정산 내역을 삭제하시겠습니까?')) return;
    try { await apiDelete(`/revenue/${id}`); fetchItems(); fetchStats(); } catch (err) { alert('삭제 실패'); }
  };

  const handlePay = async (id: number) => {
    if (!window.confirm('지급완료 처리하시겠습니까?')) return;
    try { await apiPut(`/revenue/${id}/status`, { payment_status: 'paid' }); fetchItems(); fetchStats(); }
    catch (err) { alert('처리 실패'); }
  };

  const fmt = (n: number) => (n || 0).toLocaleString('ko-KR');

  const s = {
    statRow: { display: 'flex' as const, gap: 16, marginBottom: 20 },
    statCard: (c: string) => ({ flex: 1, padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c}` }),
    topBar: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 20, gap: 12, flexWrap: 'wrap' as const },
    searchRow: { display: 'flex' as const, gap: 8, alignItems: 'center' as const },
    input: { padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', width: 220 },
    select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' },
    btn: { padding: '10px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
    btnPrimary: { padding: '10px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' },
    card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 14 },
    th: { padding: '12px 14px', textAlign: 'left' as const, background: '#f8f8fa', color: '#666', fontWeight: 600 as const, fontSize: 13, borderBottom: '2px solid #eee' },
    td: { padding: '12px 14px', borderBottom: '1px solid #f0f0f0', color: '#333' },
    badge: (bg: string, color: string) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 as const, background: bg, color }),
    actionBtn: { padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, marginRight: 3 },
    empty: { padding: 60, textAlign: 'center' as const, color: '#aaa', fontSize: 15 },
  };

  return (
    <div>
      <div style={s.statRow}>
        <div style={s.statCard('#00c853')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>지급완료</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{fmt(Number(stats.total_paid))}원</div>
          <div style={{ fontSize: 12, color: '#888' }}>{stats.paid_count}건</div>
        </div>
        <div style={s.statCard('#ffa726')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>지급대기</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{fmt(Number(stats.total_pending))}원</div>
          <div style={{ fontSize: 12, color: '#888' }}>{stats.pending_count}건</div>
        </div>
        <div style={s.statCard('#6c63ff')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{filterYear}년 {filterMonth}월 정산</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{fmt(Number(stats.monthly_paid))}원</div>
        </div>
      </div>

      <div style={s.topBar}>
        <form onSubmit={handleSearch} style={s.searchRow}>
          <input style={s.input} placeholder="설계사명, 고객명으로 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">전체 상태</option><option value="pending">대기</option><option value="paid">지급완료</option><option value="cancelled">취소</option>
          </select>
          <button type="submit" style={s.btn}>검색</button>
        </form>
        <button style={s.btnPrimary} onClick={() => { setEditItem(null); setShowForm(true); }}>+ 정산 등록</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>번호</th><th style={s.th}>설계사</th><th style={s.th}>고객명</th>
            <th style={s.th}>보험사</th><th style={s.th}>유형</th><th style={s.th}>금액</th>
            <th style={s.th}>수수료율</th><th style={s.th}>정산월</th><th style={s.th}>상태</th><th style={s.th}>관리</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={s.empty}>불러오는 중...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={10} style={s.empty}>"+ 정산 등록" 버튼을 눌러 첫 정산을 등록하세요!</td></tr>
            ) : (
              items.map((r, i) => {
                const st = statusStyle[r.payment_status] || statusStyle.pending;
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={s.td}>{r.id}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{r.agent_name || '-'}</td>
                    <td style={s.td}>{r.customer_name || '-'}</td>
                    <td style={s.td}>{r.insurance_company || '-'}</td>
                    <td style={s.td}><span style={s.badge('#e8eaf6', '#283593')}>{typeLabel[r.revenue_type] || r.revenue_type}</span></td>
                    <td style={{ ...s.td, fontWeight: 600, textAlign: 'right' }}>{fmt(r.amount)}원</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{r.commission_rate}%</td>
                    <td style={{ ...s.td, fontSize: 13 }}>{r.period_year}년 {r.period_month}월</td>
                    <td style={s.td}><span style={s.badge(st.bg, st.color)}>{st.label}</span></td>
                    <td style={s.td}>
                      {r.payment_status === 'pending' && (
                        <button style={{ ...s.actionBtn, color: '#2e7d32', borderColor: '#c8e6c9' }} onClick={() => handlePay(r.id)}>지급</button>
                      )}
                      <button style={s.actionBtn} onClick={() => { setEditItem(r); setShowForm(true); }}>수정</button>
                      <button style={{ ...s.actionBtn, color: '#e53935', borderColor: '#ffcdd2' }} onClick={() => handleDelete(r.id)}>삭제</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <RevenueForm item={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
    </div>
  );
}
