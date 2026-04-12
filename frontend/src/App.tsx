import React, { useState } from 'react';
import CustomerList from './pages/CustomerList';
import ContractList from './pages/ContractList';
import AgentList from './pages/AgentList';
import RevenueList from './pages/RevenueList';

const menuItems = [
  { id: 'customers', label: '고객 관리', icon: '👤' },
  { id: 'contracts', label: '견적/계약', icon: '📋' },
  { id: 'agents', label: '설계사 관리', icon: '🏢' },
  { id: 'revenue', label: '매출/정산', icon: '💰' },
];

function App() {
  const [currentPage, setCurrentPage] = useState('customers');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: sidebarOpen ? 220 : 60, background: '#1a1a2e', color: '#fff',
        transition: 'width 0.2s', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span style={{ fontSize: 22 }}>🚗</span>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>DODO237 ERP</span>}
        </div>
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              background: currentPage === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: currentPage === item.id ? '3px solid #6c63ff' : '3px solid transparent',
              transition: 'all 0.15s', fontSize: 14,
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          {sidebarOpen && 'v1.0.0'}
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a2e' }}>
            {menuItems.find(m => m.id === currentPage)?.icon}{' '}
            {menuItems.find(m => m.id === currentPage)?.label}
          </h1>
          <div style={{ fontSize: 13, color: '#888' }}>도도237 ERP 시스템</div>
        </header>
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {currentPage === 'customers' && <CustomerList />}
          {currentPage === 'contracts' && <ContractList />}
          {currentPage === 'agents' && <AgentList />}
          {currentPage === 'revenue' && <RevenueList />}
        </div>
      </main>
    </div>
  );
}

export default App;
