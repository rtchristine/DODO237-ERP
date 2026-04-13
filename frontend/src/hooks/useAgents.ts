// ============================================================
// hooks/useAgents.ts
// 설계사 목록 로드 커스텀 훅
// ============================================================

import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';
import { Agent } from '../types/quote';

interface UseAgentsResult {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

export function useAgents(): UseAgentsResult {
  const [agents, setAgents]   = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet('/agents')
      .then((data: Agent[] | { rows: Agent[] }) => {
        const list = Array.isArray(data) ? data : data.rows ?? [];
        // 활성 설계사만 표시
        setAgents(list.filter(a => a.status === 'active'));
      })
      .catch(() => setError('설계사 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
}
