// ============================================================
// hooks/useQuoteList.ts
// 견적 목록 조회 / 삭제 커스텀 훅
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiDelete } from '../utils/api';
import { Quote } from '../types/quote';

const PAGE_SIZE = 20;

interface UseQuoteListResult {
  quotes: Quote[];
  total: number;
  page: number;
  search: string;
  loading: boolean;
  setPage: (p: number) => void;
  setSearch: (s: string) => void;
  reload: () => void;
  deleteQuote: (id: number) => Promise<void>;
}

export function useQuoteList(): UseQuoteListResult {
  const [quotes, setQuotes]   = useState<Quote[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(PAGE_SIZE),
      ...(search ? { search } : {}),
    });
    apiGet(`/quotes?${params}`)
      .then((data: any) => {
        // 배열 / {rows, total} 두 형태 모두 처리
        if (Array.isArray(data)) {
          setQuotes(data);
          setTotal(data.length);
        } else {
          setQuotes(Array.isArray(data?.rows) ? data.rows : []);
          setTotal(data?.total ?? 0);
        }
      })
      .catch(() => alert('견적 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = useCallback((s: string) => {
    setSearch(s);
    setPage(1);
  }, []);

  const deleteQuote = useCallback(async (id: number) => {
    if (!window.confirm('이 견적을 삭제하시겠습니까?')) return;
    try {
      await apiDelete(`/quotes/${id}`);
      load();
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }, [load]);

  return {
    quotes, total, page, search, loading,
    setPage, setSearch: handleSearch,
    reload: load, deleteQuote,
  };
}
