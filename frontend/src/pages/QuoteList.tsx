import React, { useState, useEffect, useCallback } from 'react';
import QuoteForm from '../components/QuoteForm';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// 상태별 색상 & 라벨
const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '작성중', color: '#e67e22', bg: '#fef5e7' },
  calculated: { label: '산출완료', color: '#2980b9', bg: '#ebf5fb' },
  sent: { label: '발송완료', color: '#8e44ad', bg: '#f5eef8' },
  contracted: { label: '계약전환', color: '#27ae60', bg: '#eafaf1' },
};

interface QuoteRow {
  id: number;
  insured_name: string;
  phone: string;
  car_name: string;
  car_number: string;
  prev_company: string;
  status: string;
  created_at: string;
  agent_name: string;
  result_data: any;
}

interface Stats {
  total_count: number;
  draft_count: number;
  calculated_count: number;
  sent_count: number;
  contracted_count: number;
  today_count: number;
}

function QuoteList() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 폼 모달 상태
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const limit = 20;

  // 견적 목록 조회
  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const data = await apiGet(`/api/quotes?${params.toString()}`);
      setQuotes(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error('견적 목록 조회 실패:', err);
    }
    setLoading(false);
  }, [search, statusFilter, page]);

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet('/api/quotes/stats');
      setStats(data);
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuotes();
  };

  // 삭제 핸들러
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 견적을 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(`/api/quotes/${id}`);
      fetchQuotes();
      fetchStats();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiPut(`/api/quotes/${id}/status`, { status: newStatus });
      fetchQuotes();
      fetchStats();
    } catch (err) {
      alert('상태 변경 실패');
    }
  };

  // 계약 전환 핸들러
  const handleConvert = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 견적을 계약으로 전환하시겠습니까?`)) return;
    try {
      await apiPost(`/api/quotes/${id}/convert`, {});
      fetchQuotes();
      fetchStats();
      alert('계약 전환 완료!');
    } catch (err) {
      alert('계약 전환 실패');
    }
  };

  // 폼 닫기 & 새로고침
  const handleFormClose = (saved?: boolean) => {
    setShowForm(false);
    setEditId(null);
    if (saved) {
      fetchQuotes();
      fetchStats();
    }
  };

  // 날짜 포맷
  const fmtDate = (d: string) => {
    if (!d) return '-';
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`;
  };

  const totalPages = Math.ceil(total / limit);

  // 폼이 열려있으면 폼만 표시
  if (showForm) {
    return <QuoteForm quoteId={editId} onClose={handleFormClose} />;
  }

  return (
    <div>
      {/* 통계 대시보드 */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: '전체', value: stats.total_count, color: '#34495e', icon: '📊' },
            { label: '오늘', value: stats.today_count, color: '#6c63ff', icon: '📅' },
            { label: '작성중', value: stats.draft_count, color: '#e67e22', icon: '✏️' },
            { label: '산출완료', value: stats.calculated_count, color: '#2980b9', icon: '🔢' },
            { label: '발송완료', value: stats.sent_count, color: '#8e44ad', icon: '📤' },
            { label: '계약전환', value: stats.contracted_count, color: '#27ae60', icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 10, padding: '16px 14px',
              border: '1px solid #eee', cursor: 'pointer',
              borderLeft: `4px solid ${s.color}`,
            }}
            onClick={() => {
              if (s.label === '전체' || s.label === '오늘') { setStatusFilter(''); }
              else { setStatusFilter(Object.keys(statusMap).find(k => statusMap[k].label === s.label) || ''); }
              setPage(1);
            }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 검색/필터 바 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <input
            type="text" placeholder="이름 / 차량번호 / 차종 / 전화번호"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, outline: 'none' }}
          />
          <button type="submit" style={{
            padding: '8px 16px', background: '#6c63ff', color: '#fff', border: 'none',
            borderRadius: 6, fontSize: 13, cursor: 'pointer',
          }}>검색</button>
        </form>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, outline: 'none' }}>
          <option value="">전체 상태</option>
          <option value="draft">✏️ 작성중</option>
          <option value="calculated">🔢 산출완료</option>
          <option value="sent">📤 발송완료</option>
          <option value="contracted">✅ 계약전환</option>
        </select>

        <button onClick={() => { setEditId(null); setShowForm(true); }} style={{
          padding: '8px 20px', background: '#27ae60', color: '#fff', border: 'none',
          borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ 새 견적</button>
      </div>

      {/* 견적 목록 테이블 */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid #eee' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              {['ID', '피보험자', '전화번호', '차종', '차량번호', '전보험사', '상태', '담당자', '작성일', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>불러오는 중...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>견적이 없습니다</td></tr>
            ) : quotes.map(q => {
              const st = statusMap[q.status] || { label: q.status, color: '#999', bg: '#f5f5f5' };
              return (
                <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onClick={() => { setEditId(q.id); setShowForm(true); }}
                  onMouseOver={e => (e.currentTarget.style.background = '#fafbff')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 12px', color: '#aaa', fontSize: 12 }}>#{q.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{q.insured_name || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{q.phone || '-'}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.car_name || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{q.car_number || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>{q.prev_company || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                      fontSize: 11, fontWeight: 600, color: st.color, background: st.bg,
                    }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{q.agent_name || '-'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#888' }}>{fmtDate(q.created_at)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                    {q.status === 'calculated' && (
                      <button onClick={() => handleConvert(q.id, q.insured_name)} style={{
                        padding: '4px 10px', fontSize: 11, background: '#27ae60', color: '#fff',
                        border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4,
                      }}>계약전환</button>
                    )}
                    {q.status === 'draft' && (
                      <button onClick={() => handleStatusChange(q.id, 'sent')} style={{
                        padding: '4px 10px', fontSize: 11, background: '#8e44ad', color: '#fff',
                        border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4,
                      }}>발송</button>
                    )}
                    <button onClick={() => handleDelete(q.id, q.insured_name)} style={{
                      padding: '4px 10px', fontSize: 11, background: '#e74c3c', color: '#fff',
                      border: 'none', borderRadius: 4, cursor: 'pointer',
                    }}>삭제</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: page <= 1 ? 'default' : 'pointer', fontSize: 13 }}>◀</button>
          <span style={{ padding: '6px 14px', fontSize: 13, color: '#555' }}>{page} / {totalPages} ({total}건)</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 13 }}>▶</button>
        </div>
      )}
    </div>
  );
}

export default QuoteList;
