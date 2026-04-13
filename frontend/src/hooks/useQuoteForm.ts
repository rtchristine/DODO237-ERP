// ============================================================
// hooks/useQuoteForm.ts
// 견적 폼 상태 관리 및 저장 로직
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';
import { QuoteFormState, QuoteSavePayload } from '../types/quote';
import { ParseResult, ParsedInsurer } from '../types/parser';
import { EMPTY_QUOTE_FORM } from '../constants/insurance';
import { enrichWithRates } from '../utils/rate-calculator';

interface UseQuoteFormResult {
  form: QuoteFormState;
  insurers: ParsedInsurer[];    // 파싱된 보험사 목록 (cm/tm 포함)
  loading: boolean;
  saving: boolean;
  setField: (key: keyof QuoteFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  applyParsed: (result: ParseResult) => void;
  save: () => Promise<boolean>;
}

export function useQuoteForm(quoteId: number | null): UseQuoteFormResult {
  const [form, setForm]         = useState<QuoteFormState>({ ...EMPTY_QUOTE_FORM });
  const [insurers, setInsurers] = useState<ParsedInsurer[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);

  // 기존 견적 불러오기
  useEffect(() => {
    if (!quoteId) return;
    setLoading(true);
    apiGet(`/quotes/${quoteId}`)
      .then((d: any) => {
        setForm({
          insuredName:      d.insured_name       ?? '',
          carno:            d.car_number         ?? '',
          carname:          d.car_name           ?? '',
          carYear:          d.car_year           != null ? String(d.car_year) : '',
          carPrice:         d.car_price          ?? '',
          startDate:        d.start_date         ? d.start_date.slice(0, 10) : '',
          endDate:          d.end_date           ? d.end_date.slice(0, 10)   : '',
          usageType:        d.usage_type         ?? '',
          driveRange:       d.drive_range        ?? '',
          ageLimit:         d.age_limit          ?? '',
          prevInsurer:      d.prev_insurer       ?? '',
          discGrade:        d.disc_grade         ?? '',
          payMethod:        d.pay_method         ?? '',
          specialDiscounts: d.special_discounts  ?? '',
          coverDaeinII:     d.cover_daein2       ?? '무한',
          coverDaemul:      d.cover_daemul       ?? '5억원',
          coverJasang:      d.cover_jasang       ?? '',
          coverMuboheom:    d.cover_muboheom     ?? '',
          coverJacha:       d.cover_jacha        ?? '가입',
          coverEmergency:   d.cover_emergency    ?? '',
          memo:             d.memo               ?? '',
          agentId:          d.agent_id           != null ? String(d.agent_id) : '',
        });
      })
      .catch(() => alert('견적 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [quoteId]);

  // 필드 변경 핸들러
  const setField = useCallback(
    (key: keyof QuoteFormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [key]: e.target.value }));
      },
    []
  );

  // 파싱 결과 → 폼 자동 입력 + 보험사 목록 저장
  const applyParsed = useCallback((result: ParseResult) => {
    const { info, coverages, insurers: parsedInsurers } = result;

    // 담보 맵 생성
    const covMap: Record<string, string> = {};
    coverages.forEach(c => { covMap[c.key] = c.val; });

    // 종료일: 시작일 + 1년 자동 계산
    let endDate = '';
    if (info.startDate) {
      const [y, m, d] = info.startDate.split('-');
      endDate = `${parseInt(y) + 1}-${m}-${d}`;
    }

    // 폼 업데이트
    setForm(prev => ({
      ...prev,
      insuredName:      info.name        || prev.insuredName,
      carno:            info.carno       || prev.carno,
      carname:          info.carname     || prev.carname,
      carYear:          info.year        || prev.carYear,
      carPrice:         info.carPrice    || prev.carPrice,
      startDate:        info.startDate   || prev.startDate,
      endDate:          endDate          || prev.endDate,
      usageType:        info.usage       || prev.usageType,
      driveRange:       info.drive       || prev.driveRange,
      ageLimit:         info.age         || prev.ageLimit,
      prevInsurer:      info.prev        || prev.prevInsurer,
      discGrade:        info.discGrade   || prev.discGrade,
      payMethod:        info.payMethod   || prev.payMethod,
      specialDiscounts: info.specials    || prev.specialDiscounts,
      coverDaeinII:     covMap['대인II']   || prev.coverDaeinII,
      coverDaemul:      covMap['대물']     || prev.coverDaemul,
      coverJasang:      covMap['자상']     || prev.coverJasang,
      coverMuboheom:    covMap['무보험']   || prev.coverMuboheom,
      coverJacha:       covMap['자기차량'] || prev.coverJacha,
      coverEmergency:   covMap['긴급출동'] || prev.coverEmergency,
    }));

    // 보험사 목록: CM/TM 계산값 추가 후 저장
    setInsurers(enrichWithRates(parsedInsurers));
  }, []);

  // 저장 (신규 / 수정)
  const save = useCallback(async (): Promise<boolean> => {
    if (!form.insuredName && !form.carno) {
      alert('고객명 또는 차량번호를 입력해주세요.');
      return false;
    }

    const payload: QuoteSavePayload = {
      insured_name:      form.insuredName,
      car_number:        form.carno,
      car_name:          form.carname,
      car_year:          form.carYear ? parseInt(form.carYear) : null,
      car_price:         form.carPrice         || null,
      start_date:        form.startDate        || null,
      end_date:          form.endDate          || null,
      usage_type:        form.usageType        || null,
      drive_range:       form.driveRange       || null,
      age_limit:         form.ageLimit         || null,
      prev_insurer:      form.prevInsurer      || null,
      disc_grade:        form.discGrade        || null,
      pay_method:        form.payMethod        || null,
      special_discounts: form.specialDiscounts || null,
      cover_daein2:      form.coverDaeinII     || null,
      cover_daemul:      form.coverDaemul      || null,
      cover_jasang:      form.coverJasang      || null,
      cover_muboheom:    form.coverMuboheom    || null,
      cover_jacha:       form.coverJacha       || null,
      cover_emergency:   form.coverEmergency   || null,
      memo:              form.memo             || null,
      agent_id:          form.agentId ? parseInt(form.agentId) : null,
      status:            'draft',
    };

    setSaving(true);
    try {
      if (quoteId) {
        await apiPut(`/quotes/${quoteId}`, payload);
      } else {
        await apiPost('/quotes', payload);
      }
      return true;
    } catch {
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, quoteId]);

  return { form, insurers, loading, saving, setField, applyParsed, save };
}
