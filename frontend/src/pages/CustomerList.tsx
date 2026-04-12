import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import CustomerForm from '../components/CustomerForm';

interface Customer {
  id: number;
  name: string;
  phone: string;
  car_number: string;
  car_model: string;
  car_year: number;
  birthdate: string;
  gender: string;
  address: string;
  memo: string;
  agent_id: number;
  agent_name: string;
  source: string;
  created_at: string;
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
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleSave = async (data: any) => {
    try {
      if (editCustomer) {
        await apiPut(`/customers/${editCustomer.id}`, data);
      } else {
        await apiPost('/customers', data);
      }
      setShowForm(false);
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" - Delete this customer?`)) return;
    try {
      await apiDelete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setShowForm(true);
  };

  const styles = {
    card: {
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      overflow: 'hidden' as const,
    },
    topBar: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 20,
      gap: 12,
      flexWrap: 'wrap' as const,
    },
    searchBox: {
      display: 'flex' as const,
      gap: 8,
    },
    input: {
      padding: '10px 14px',
      border: '1px solid #ddd',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      width: 260,
    },
    btnPrimary: {
      padding: '10px 20px',
      background: '#6c63ff',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600 as const,
      cursor: 'pointer',
    },
    btnSearch: {
      padding: '10px 16px',
      background: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 14,
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: 14,
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left' as const,
      background: '#f8f8fa',
      color: '#666',
      fontWeight: 600 as const,
      fontSize: 13,
      borderBottom: '2px solid #eee',
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #f0f0f0',
      color: '#333',
    },
    badge: (type: string) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500 as const,
      background: type === 'direct' ? '#e8f5e9' : type === 'referral' ? '#fff3e0' : '#e3f2fd',
      color: type === 'direct' ? '#2e7d32' : type === 'referral' ? '#ef6c00' : '#1565c0',
    }),
    actionBtn: {
      padding: '5px 10px',
      border: '1px solid #ddd',
      borderRadius: 6,
      background: '#fff',
      cursor: 'pointer',
      fontSize: 12,
      marginRight: 4,
    },
    empty: {
      padding: 60,
      textAlign: 'center' as const,
      color: '#aaa',
      fontSize: 15,
    },
    pagination: {
      display: 'flex' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: 12,
      padding: '16px 0',
    },
    pageBtn: (active: boolean) => ({
      padding: '6px 12px',
      border: '1px solid ' + (active ? '#6c63ff' : '#ddd'),
      borderRadius: 6,
      background: active ? '#6c63ff' : '#fff',
      color: active ? '#fff' : '#333',
      cursor: 'pointer',
      fontSize: 13,
    }),
    stat: {
      display: 'flex' as const,
      gap: 16,
      marginBottom: 20,
    },
    statCard: (color: string) => ({
      flex: 1,
      padding: '20px',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
    }),
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Stats */}
      <div style={styles.stat}>
        <div style={styles.statCard('#6c63ff')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Total Customers</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{total}</div>
        </div>
        <div style={styles.statCard('#00c853')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Registered Today</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
            {customers.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div style={styles.statCard('#ff6b6b')}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Current Page</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{page} / {totalPages || 1}</div>
        </div>
      </div>

      {/* Top bar */}
      <div style={styles.topBar}>
        <form onSubmit={handleSearch} style={styles.searchBox}>
          <input
            style={styles.input}
            placeholder="Search by name, phone, car number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" style={styles.btnSearch}>Search</button>
        </form>
        <button
          style={styles.btnPrimary}
          onClick={() => { setEditCustomer(null); setShowForm(true); }}
        >
          + New Customer
        </button>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>No</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Car Number</th>
              <th style={styles.th}>Car Model</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={styles.empty}>Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={8} style={styles.empty}>No customers found. Click "+ New Customer" to add one!</td></tr>
            ) : (
              customers.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={styles.td}>{c.id}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{c.name}</td>
                  <td style={styles.td}>{c.phone || '-'}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace' }}>{c.car_number || '-'}</td>
                  <td style={styles.td}>{c.car_model || '-'}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(c.source || 'direct')}>{c.source || 'direct'}</span>
                  </td>
                  <td style={{ ...styles.td, fontSize: 13, color: '#888' }}>
                    {new Date(c.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => handleEdit(c)}>Edit</button>
                    <button
                      style={{ ...styles.actionBtn, color: '#e53935', borderColor: '#ffcdd2' }}
                      onClick={() => handleDelete(c.id, c.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn(false)}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span style={{ fontSize: 14, color: '#666' }}>
              {page} / {totalPages}
            </span>
            <button
              style={styles.pageBtn(false)}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editCustomer}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditCustomer(null); }}
        />
      )}
    </div>
  );
}
