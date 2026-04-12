import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ContractForm from '../components/ContractForm';

interface Contract {
  id: number;
  customer_id: number;
  customer_name: string;
  car_number: string;
  customer_phone: string;
  agent_id: number;
  agent_name: string;
  quote_type: string;
  insurance_company: string;
  premium: number;
  discount_rate: number;
  coverage_type: string;
  driver_range: string;
  age_range: string;
  insurance_period: string;
  previous_company: string;
  status: string;
  contract_date: string;
  start_date: string;
  end_date: string;
  memo: string;
  created_at: string;
}

interface Stats {
  quote_count: number;
  contract_count: number;
  expired_count: number;
  total_premium: number;
}

const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  quote:     { label: 'Quote',     bg: '#e3f2fd', color: '#1565c0' },
  contract:  { label: 'Contract',  bg: '#e8f5e9', color: '#2e7d32' },
  cancelled: { label: 'Cancelled', bg: '#fce4ec', color: '#c62828' },
  expired:   { label: 'Expired',   bg: '#f3e5f5', color: '#6a1b9a' },
};

const typeMap: Record<string, { label: string; bg: string; color: string }> = {
  CM:      { label: 'CM',      bg: '#e8eaf6', color: '#283593' },
  TM:      { label: 'TM',      bg: '#fff3e0', color: '#e65100' },
  offline: { label: 'Offline', bg: '#efebe9', color: '#4e342e' },
};

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<Stats>({ quote_count: 0, contract_count: 0, expired_count: 0, total_premium: 0 });
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editContract, setEditContract] = useState<Contract | null>(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('quote_type', typeFilter);
      params.append('page', String(page));
      params.append('limit', '20');
      const data = await apiGet(`/contracts?${params}`);
      setContracts(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const data = await apiGet('/contracts/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchContracts(); fetchStats(); }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  const handleSave = async (data: any) => {
    try {
      if (editContract) {
        await apiPut(`/contracts/${editContract.id}`, data);
      } else {
        await apiPost('/contracts', data);
      }
      setShowForm(false);
      setEditContract(null);
      fetchContracts();
      fetchStats();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this contract?')) return;
    try {
      await apiDelete(`/contracts/${id}`);
      fetchContracts();
      fetchStats();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiPut(`/contracts/${id}/status`, { status: newStatus });
      fetchContracts();
      fetchStats();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const formatNum = (n: number) => n?.toLocaleString('ko-KR') || '0';

  const s = {
    statRow: { display: 'flex' as const, gap: 16, marginBottom: 20 },
    statCard: (c: string) => ({
      flex: 1, padding: 20, background: '#fff', borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c}`,
    }),
    statLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
    statValue: { fontSize: 28, fontWeight: 700 as const, color: '#1a1a2e' },
    topBar: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 20, gap: 12, flexWrap: 'wrap' as const },
    searchRow: { display: 'flex' as const, gap: 8, alignItems: 'center' as const, flexWrap: 'wrap' as const },
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
    pagination: { display: 'flex' as const, justifyContent: 'center' as const, gap: 12, padding: '16px 0', alignItems: 'center' as const },
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Stats */}
      <div style={s.statRow}>
        <div style={s.statCard('#6c63ff')}>
          <div style={s.statLabel}>Quotes</div>
          <div style={s.statValue}>{stats.quote_count}</div>
        </div>
        <div style={s.statCard('#00c853')}>
          <div style={s.statLabel}>Contracts</div>
          <div style={s.statValue}>{stats.contract_count}</div>
        </div>
        <div style={s.statCard('#ff6b6b')}>
          <div style={s.statLabel}>Expired</div>
          <div style={s.statValue}>{stats.expired_count}</div>
        </div>
        <div style={s.statCard('#ffa726')}>
          <div style={s.statLabel}>Total Premium</div>
          <div style={{ ...s.statValue, fontSize: 22 }}>{formatNum(Number(stats.total_premium))}</div>
        </div>
      </div>

      {/* Top bar */}
      <div style={s.topBar}>
        <form onSubmit={handleSearch} style={s.searchRow}>
          <input style={s.input} placeholder="Name, car number, insurer..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="quote">Quote</option>
            <option value="contract">Contract</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          <select style={s.select} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="CM">CM</option>
            <option value="TM">TM</option>
            <option value="offline">Offline</option>
          </select>
          <button type="submit" style={s.btn}>Search</button>
        </form>
        <button style={s.btnPrimary} onClick={() => { setEditContract(null); setShowForm(true); }}>+ New Quote</button>
      </div>

      {/* Table */}
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>No</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Car No.</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Insurer</th>
              <th style={s.th}>Premium</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={s.empty}>Loading...</td></tr>
            ) : contracts.length === 0 ? (
              <tr><td colSpan={9} style={s.empty}>No contracts found. Click "+ New Quote" to add one!</td></tr>
            ) : (
              contracts.map((c, i) => {
                const st = statusMap[c.status] || statusMap.quote;
                const tp = typeMap[c.quote_type] || typeMap.CM;
                return (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={s.td}>{c.id}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{c.customer_name || '-'}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}>{c.car_number || '-'}</td>
                    <td style={s.td}><span style={s.badge(tp.bg, tp.color)}>{tp.label}</span></td>
                    <td style={s.td}>{c.insurance_company || '-'}</td>
                    <td style={{ ...s.td, fontWeight: 600, textAlign: 'right' }}>{formatNum(c.premium)}</td>
                    <td style={s.td}><span style={s.badge(st.bg, st.color)}>{st.label}</span></td>
                    <td style={{ ...s.td, fontSize: 13, color: '#888' }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</td>
                    <td style={s.td}>
                      {c.status === 'quote' && (
                        <button style={{ ...s.actionBtn, color: '#2e7d32', borderColor: '#c8e6c9' }}
                          onClick={() => handleStatusChange(c.id, 'contract')}>Contract</button>
                      )}
                      <button style={s.actionBtn} onClick={() => { setEditContract(c); setShowForm(true); }}>Edit</button>
                      <button style={{ ...s.actionBtn, color: '#e53935', borderColor: '#ffcdd2' }}
                        onClick={() => handleDelete(c.id)}>Del</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={s.pagination}>
            <button style={{ ...s.actionBtn, padding: '6px 12px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span style={{ fontSize: 14, color: '#666' }}>{page} / {totalPages}</span>
            <button style={{ ...s.actionBtn, padding: '6px 12px' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>

      {showForm && (
        <ContractForm
          contract={editContract}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditContract(null); }}
        />
      )}
    </div>
  );
}
