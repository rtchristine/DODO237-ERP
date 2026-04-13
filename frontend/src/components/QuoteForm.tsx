import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';
import QuoteResult from './QuoteResult';

interface QuoteFormProps {
  quoteId: number | null;
  onClose: (saved?: boolean) => void;
}

const fieldStyles = {
  label: { fontSize: 12, color: '#666', marginBottom: 3, display: 'block', fontWeight: 500 as const } as React.CSSProperties,
  input: { width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 5, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
  select: { width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 5, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' as const } as React.CSSProperties,
};
const sectionStyle = { background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '16px 20px', marginBottom: 14 } as React.CSSProperties;
const sectionTitleStyle = { fontSize: 14, fontWeight: 700 as const, color: '#1a1a2e', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #6c63ff', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties;
const gridStyle = (cols: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px 14px' }) as React.CSSProperties;

const defaultForm: Record<string, any> = {
  customer_id: '', agent_id: '', person_type: 'personal',
  insured_name: '', jumin: '', phone: '',
  corp_name: '', biz_no: '', corp_no: '', ceo_name: '',
  prev_company: '', prev_premium: 0, driver_range: '', age_limit: '',
  driver_name: '', driver_birth: '', driver_gender: '',
  car_code: '', car_name: '', car_number: '', car_year: '', car_price: 0,
  cc: 0, car_grade: '', people: '', sports: '',
  airbag: '0', abs_yn: '0', steal_yn: '0', transmission: '', fuel_type: '', outset_date: '',
  dambo_d2: '8', dambo_dm: '05', dambo_js: '2', dambo_mu: '2', dambo_jc: '2', dambo_em: '1',
  insurance_start: '', insurance_end: '',
  career_ins: 'B5', career_car: 'B5', prev_3yr: '4', halin_grade: '13Z',
  traffic_code: 'C012', traffic_count: 0, car_count: 1, muljuk: 200,
  acci_3yr: 0, acci_1yr: 0, acci_score: 0,
  discount_tags: {}, map_type: '0', map_score: '0', mileage: '0',
  hd_special: 'h01', samsung_3yr: '', meritz_3yr: 'B5',
  parts_total: 0, parts_detail: {}, result_data: [],
  status: 'draft', memo: '',
};

const options = {
  personType: [{ value: 'personal', label: '개인' }, { value: 'corp', label: '법인' }],
  prevCompany: [
    { value: '', label: '선택' }, { value: '01', label: '삼성화재' }, { value: '02', label: 'DB손보' },
    { value: '03', label: 'KB손보' }, { value: '04', label: '현대해상' }, { value: '05', label: '메리츠화재' },
    { value: '06', label: '한화손보' }, { value: '07', label: '롯데손보' }, { value: '08', label: 'MG손보' },
    { value: '09', label: '흥국화재' }, { value: '10', label: 'AXA손보' }, { value: '11', label: '캐롯손보' },
    { value: '12', label: '하나손보' }, { value: '99', label: '신규' },
  ],
  driverRange: [
    { value: '', label: '선택' }, { value: '01', label: '피보험자 1인' }, { value: '02', label: '부부한정' },
    { value: '03', label: '부부+자녀(1인)' }, { value: '04', label: '부부+자녀(2인이상)' },
    { value: '05', label: '가족한정(형제자매 포함)' }, { value: '06', label: '누구나' },
    { value: '07', label: '부부+지정1인' }, { value: '08', label: '부부+지정2인' },
  ],
  ageLimit: [
    { value: '', label: '선택' }, { value: '21', label: '만21세이상' }, { value: '22', label: '만22세이상' },
    { value: '23', label: '만23세이상' }, { value: '24', label: '만24세이상' }, { value: '26', label: '만26세이상' },
    { value: '30', label: '만30세이상' }, { value: '35', label: '만35세이상' },
    { value: '43', label: '만43세이상' }, { value: '48', label: '만48세이상' },
  ],
  transmission: [{ value: '', label: '선택' }, { value: '1', label: '자동' }, { value: '2', label: '수동' }],
  fuelType: [
    { value: '', label: '선택' }, { value: '1', label: '가솔린' }, { value: '2', label: '경유' },
    { value: '3', label: 'LPG' }, { value: '4', label: '전기' }, { value: '5', label: '하이브리드' }, { value: '6', label: '수소' },
  ],
  damboD2: [{ value: '5', label: '5천만원' }, { value: '8', label: '1억원' }, { value: '9', label: '2억원' }, { value: '10', label: '3억원' }, { value: '12', label: '5억원' }],
  damboDm: [{ value: '05', label: '5천만원' }, { value: '10', label: '1억원' }, { value: '15', label: '1.5억원' }, { value: '20', label: '2억원' }, { value: '30', label: '3억원' }],
  damboJs: [{ value: '0', label: '미가입' }, { value: '1', label: '가입(5/3)' }, { value: '2', label: '가입(5/5)' }, { value: '3', label: '가입(1억)' }],
  damboMu: [{ value: '0', label: '미가입' }, { value: '1', label: '자기부담 20만원' }, { value: '2', label: '자기부담 50만원' }, { value: '3', label: '자기부담 100만원' }],
  damboJc: [{ value: '0', label: '미가입' }, { value: '1', label: '50만원' }, { value: '2', label: '100만원' }, { value: '3', label: '200만원' }],
  damboEm: [{ value: '0', label: '미가입' }, { value: '1', label: '가입' }],
  careerIns: [
    { value: 'A1', label: '1년이상 2년미만' }, { value: 'A2', label: '2년이상 3년미만' },
    { value: 'B3', label: '3년이상 4년미만' }, { value: 'B4', label: '4년이상 5년미만' },
    { value: 'B5', label: '5년이상' }, { value: 'C0', label: '1년미만' }, { value: 'X0', label: '없음' },
  ],
  prev3yr: [{ value: '1', label: '1건' }, { value: '2', label: '2건' }, { value: '3', label: '3건' }, { value: '4', label: '0건(무사고)' }, { value: '5', label: '4건이상' }],
  halinGrade: [
    { value: '1Z', label: '1Z (최고할인)' }, { value: '2Z', label: '2Z' }, { value: '3Z', label: '3Z' },
    { value: '4Z', label: '4Z' }, { value: '5Z', label: '5Z' }, { value: '6Z', label: '6Z' },
    { value: '7Z', label: '7Z' }, { value: '8Z', label: '8Z' }, { value: '9Z', label: '9Z' },
    { value: '10Z', label: '10Z' }, { value: '11Z', label: '11Z (기본)' }, { value: '12Z', label: '12Z' },
    { value: '13Z', label: '13Z (신규)' }, { value: '14Z', label: '14Z' }, { value: '15Z', label: '15Z (최고할증)' },
  ],
  trafficCode: [
    { value: 'C012', label: 'S1 (최우수)' }, { value: 'C011', label: 'S2' }, { value: 'C010', label: '1등급' },
    { value: 'C009', label: '2등급' }, { value: 'C008', label: '3등급' }, { value: 'C007', label: '4등급' },
    { value: 'C006', label: '5등급' }, { value: 'C005', label: '6등급' }, { value: 'C004', label: '7등급' },
    { value: 'C003', label: '8등급' }, { value: 'C002', label: '9등급' }, { value: 'C001', label: '10등급 (최하)' },
  ],
  mapType: [{ value: '0', label: '미가입' }, { value: '1', label: 'T맵' }, { value: '2', label: '카카오내비' }],
  mileage: [
    { value: '0', label: '미적용' }, { value: '3', label: '3000km 이하' }, { value: '5', label: '5000km 이하' },
    { value: '7', label: '7000km 이하' }, { value: '10', label: '10000km 이하' }, { value: '15', label: '15000km 이하' },
  ],
  hdSpecial: [{ value: 'h01', label: '일반' }, { value: 'h02', label: '현대해상 추가할인' }],
  meritz3yr: [{ value: 'B5', label: '5년이상' }, { value: 'B4', label: '4년이상' }, { value: 'B3', label: '3년이상' }],
  airbag: [{ value: '0', label: '없음' }, { value: '1', label: '운전석' }, { value: '2', label: '운전석+조수석' }, { value: '3', label: '커튼에어백' }],
};

function QuoteForm({ quoteId, onClose }: QuoteFormProps) {
  const [form, setForm] = useState<Record<string, any>>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isEdit = quoteId !== null;
  const [calculating, setCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any[]>([]);
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [carSearchResults, setCarSearchResults] = useState<any[]>([]);
  const [showCarSearch, setShowCarSearch] = useState(false);
  const [carSearching, setCarSearching] = useState(false);

  useEffect(() => {
    if (quoteId) {
      (async () => {
        try {
          const data = await apiGet(`/api/quotes/${quoteId}`);
          if (typeof data.discount_tags === 'string') data.discount_tags = JSON.parse(data.discount_tags);
          if (typeof data.parts_detail === 'string') data.parts_detail = JSON.parse(data.parts_detail);
          if (typeof data.result_data === 'string') data.result_data = JSON.parse(data.result_data);
          setForm({ ...defaultForm, ...data });
          if (Array.isArray(data.result_data) && data.result_data.length > 0) setResultData(data.result_data);
        } catch (err) { alert('견적 데이터 로드 실패'); onClose(); }
      })();
    }
  }, [quoteId, onClose]);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.insured_name.trim()) { alert('피보험자 이름을 입력해주세요.'); return; }
    setSaving(true);
    try {
      if (isEdit) await apiPut(`/api/quotes/${quoteId}`, form);
      else await apiPost('/api/quotes', form);
      onClose(true);
    } catch (err) { alert('저장 실패'); }
    setSaving(false);
  };

  const handleCarSearch = async () => {
    if (!carSearchQuery.trim()) return;
    setCarSearching(true);
    try {
      const data = await apiGet(`/api/proxy/carcode/search?q=${encodeURIComponent(carSearchQuery)}`);
      setCarSearchResults(Array.isArray(data) ? data : []);
      setShowCarSearch(true);
    } catch (err) { alert('차명코드 검색 서버에 연결할 수 없습니다.'); setCarSearchResults([]); }
    setCarSearching(false);
  };

  const handleCarSelect = async (car: any) => {
    setShowCarSearch(false); setCarSearchQuery('');
    setForm(prev => ({
      ...prev,
      car_code: car.code || car.car_code || '', car_name: car.name || car.car_name || '',
      car_year: car.year || car.car_year || '', car_price: car.price || car.car_price || 0,
      cc: car.cc || 0, car_grade: car.grade || car.car_grade || '',
      people: car.people || '', sports: car.sports || '',
      transmission: car.transmission || '', fuel_type: car.fuel_type || car.fuelType || '',
    }));
    const code = car.code || car.car_code;
    if (code) {
      try {
        const detail = await apiGet(`/api/proxy/carcode/${code}`);
        if (detail) {
          const u: Record<string, any> = {};
          if (detail.airbag) u.airbag = detail.airbag;
          if (detail.abs_yn) u.abs_yn = detail.abs_yn;
          if (detail.steal_yn) u.steal_yn = detail.steal_yn;
          if (detail.outset_date) u.outset_date = detail.outset_date;
          if (Object.keys(u).length > 0) setForm(prev => ({ ...prev, ...u }));
        }
      } catch (err) {}
    }
  };

  const handleCalculate = async () => {
    if (!form.insured_name.trim()) { alert('피보험자 이름을 입력해주세요.'); return; }
    if (!form.car_code && !form.car_name) { alert('차량 정보를 입력해주세요.'); return; }
    setCalculating(true);
    try {
      if (isEdit) await apiPut(`/api/quotes/${quoteId}`, form);
      else { const saved = await apiPost('/api/quotes', form); setForm(prev => ({ ...prev, id: saved.id })); }
      const calcResult = await apiPost('/api/proxy/calculate', form);
      if (calcResult && Array.isArray(calcResult)) { setResultData(calcResult); setShowResult(true); }
      else if (calcResult && calcResult.data && Array.isArray(calcResult.data)) { setResultData(calcResult.data); setShowResult(true); }
      else if (calcResult && calcResult.error) alert(`산출 실패: ${calcResult.error}`);
      else alert('산출 결과를 받지 못했습니다.\n외부 산출 API 서버를 확인해주세요.');
    } catch (err: any) { alert(`보험료 산출 서버에 연결할 수 없습니다.\n${err?.message || ''}`); }
    setCalculating(false);
  };

  const handleSaveResult = async (results: any[]) => {
    const targetId = quoteId || form.id;
    if (!targetId) { alert('견적을 먼저 저장해주세요.'); return; }
    setSaving(true);
    try { await apiPut(`/api/quotes/${targetId}/result`, { result_data: results }); alert('산출 결과가 저장되었습니다.'); onClose(true); }
    catch (err) { alert('결과 저장 실패'); }
    setSaving(false);
  };

  const toggle = (key: string) => setActiveSection(prev => prev === key ? null : key);

  if (showResult) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setShowResult(false)} style={{ padding: '6px 14px', background: '#f0f0f0', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>← 입력화면</button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>📊 산출 결과 — {form.insured_name} ({form.car_name || '차종미입력'})</h2>
          </div>
        </div>
        <QuoteResult results={resultData} onClose={() => setShowResult(false)} onSave={handleSaveResult} saving={saving} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => onClose()} style={{ padding: '6px 14px', background: '#f0f0f0', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>← 목록</button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{isEdit ? `견적 수정 #${quoteId}` : '새 견적 작성'}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {resultData.length > 0 && <button onClick={() => setShowResult(true)} style={{ padding: '8px 16px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>📊 결과보기</button>}
          <button onClick={() => onClose()} style={{ padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>취소</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '저장중...' : '💾 저장'}</button>
          <button onClick={handleCalculate} disabled={calculating} style={{ padding: '8px 28px', background: calculating ? '#95a5a6' : '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{calculating ? '⏳ 산출중...' : '🔢 보험료 산출'}</button>
        </div>
      </div>

      {/* 섹션 1: 피보험자 정보 */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}><span>👤</span> 피보험자 정보</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {options.personType.map(o => (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" name="person_type" checked={form.person_type === o.value} onChange={() => handleChange('person_type', o.value)} />{o.label}
            </label>
          ))}
        </div>
        <div style={gridStyle(4)}>
          <div><label style={fieldStyles.label}>피보험자명 *</label><input type="text" value={form.insured_name ?? ''} placeholder="홍길동" onChange={e => handleChange('insured_name', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>주민번호(앞7자리)</label><input type="text" value={form.jumin ?? ''} placeholder="900101-1" onChange={e => handleChange('jumin', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>전화번호</label><input type="text" value={form.phone ?? ''} placeholder="010-1234-5678" onChange={e => handleChange('phone', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>담당 설계사 ID</label><input type="number" value={form.agent_id || ''} placeholder="미지정" onChange={e => handleChange('agent_id', e.target.value ? Number(e.target.value) : null)} style={fieldStyles.input} /></div>
        </div>
        {form.person_type === 'corp' && (
          <div style={{ ...gridStyle(4), marginTop: 10, padding: 12, background: '#f9f9fb', borderRadius: 6 }}>
            <div><label style={fieldStyles.label}>법인명</label><input type="text" value={form.corp_name ?? ''} placeholder="(주)도도237" onChange={e => handleChange('corp_name', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>사업자번호</label><input type="text" value={form.biz_no ?? ''} placeholder="123-45-67890" onChange={e => handleChange('biz_no', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>법인번호</label><input type="text" value={form.corp_no ?? ''} onChange={e => handleChange('corp_no', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>대표자명</label><input type="text" value={form.ceo_name ?? ''} onChange={e => handleChange('ceo_name', e.target.value)} style={fieldStyles.input} /></div>
          </div>
        )}
      </div>

      {/* 섹션 2: 차량 정보 */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}><span>🚗</span> 차량 정보</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#f0f4ff', borderRadius: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap', fontWeight: 600 }}>🔍 차명코드 검색</span>
          <input type="text" value={carSearchQuery} placeholder="차종명 입력 (예: 쏘나타, K5, 아반떼)" onChange={e => setCarSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCarSearch()} style={{ flex: 1, padding: '7px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 13, outline: 'none' }} />
          <button onClick={handleCarSearch} disabled={carSearching} style={{ padding: '7px 16px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>{carSearching ? '검색중...' : '검색'}</button>
        </div>
        {showCarSearch && (
          <div style={{ marginBottom: 14, border: '1px solid #ddd', borderRadius: 8, maxHeight: 200, overflowY: 'auto', background: '#fff' }}>
            {carSearchResults.length === 0 ? <div style={{ padding: 16, textAlign: 'center', color: '#aaa', fontSize: 13 }}>검색 결과가 없습니다</div>
            : carSearchResults.map((car, i) => (
              <div key={i} onClick={() => handleCarSelect(car)} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseOver={e => (e.currentTarget.style.background = '#f0f4ff')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                <div><span style={{ fontWeight: 600 }}>{car.name || car.car_name}</span><span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>{car.year || car.car_year}년 | {car.cc}cc</span></div>
                <span style={{ color: '#aaa', fontSize: 11 }}>{car.code || car.car_code}</span>
              </div>
            ))}
            <div style={{ padding: '6px 14px', textAlign: 'right' }}><button onClick={() => setShowCarSearch(false)} style={{ padding: '4px 12px', fontSize: 11, background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer' }}>닫기</button></div>
          </div>
        )}
        <div style={gridStyle(4)}>
          <div><label style={fieldStyles.label}>차명코드</label><input type="text" value={form.car_code ?? ''} placeholder="차명코드" onChange={e => handleChange('car_code', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>차종명</label><input type="text" value={form.car_name ?? ''} placeholder="쏘나타 DN8" onChange={e => handleChange('car_name', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>차량번호</label><input type="text" value={form.car_number ?? ''} placeholder="12가3456" onChange={e => handleChange('car_number', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>연식</label><input type="number" value={form.car_year ?? ''} placeholder="2024" onChange={e => handleChange('car_year', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
        </div>
        <div style={{ ...gridStyle(6), marginTop: 10 }}>
          <div><label style={fieldStyles.label}>차량가액(만원)</label><input type="number" value={form.car_price ?? 0} onChange={e => handleChange('car_price', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>배기량(cc)</label><input type="number" value={form.cc ?? 0} onChange={e => handleChange('cc', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>차량등급</label><input type="text" value={form.car_grade ?? ''} onChange={e => handleChange('car_grade', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>인승</label><input type="text" value={form.people ?? ''} onChange={e => handleChange('people', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>스포츠카</label><input type="text" value={form.sports ?? ''} onChange={e => handleChange('sports', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>출고일</label><input type="text" value={form.outset_date ?? ''} placeholder="20240101" onChange={e => handleChange('outset_date', e.target.value)} style={fieldStyles.input} /></div>
        </div>
        <div style={{ ...gridStyle(5), marginTop: 10 }}>
          <div><label style={fieldStyles.label}>에어백</label><select value={form.airbag ?? '0'} onChange={e => handleChange('airbag', e.target.value)} style={fieldStyles.select}>{options.airbag.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label style={fieldStyles.label}>ABS</label><select value={form.abs_yn ?? '0'} onChange={e => handleChange('abs_yn', e.target.value)} style={fieldStyles.select}><option value="0">없음</option><option value="1">있음</option></select></div>
          <div><label style={fieldStyles.label}>도난방지</label><select value={form.steal_yn ?? '0'} onChange={e => handleChange('steal_yn', e.target.value)} style={fieldStyles.select}><option value="0">없음</option><option value="1">있음</option></select></div>
          <div><label style={fieldStyles.label}>변속기</label><select value={form.transmission ?? ''} onChange={e => handleChange('transmission', e.target.value)} style={fieldStyles.select}>{options.transmission.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label style={fieldStyles.label}>연료</label><select value={form.fuel_type ?? ''} onChange={e => handleChange('fuel_type', e.target.value)} style={fieldStyles.select}>{options.fuelType.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        </div>
      </div>

      {/* 섹션 3: 보험/담보 설정 */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}><span>🛡️</span> 보험/담보 설정</div>
        <div style={gridStyle(3)}>
          <div><label style={fieldStyles.label}>전보험사</label><select value={form.prev_company ?? ''} onChange={e => handleChange('prev_company', e.target.value)} style={fieldStyles.select}>{options.prevCompany.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label style={fieldStyles.label}>전보험료</label><input type="number" value={form.prev_premium ?? 0} onChange={e => handleChange('prev_premium', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>보험시작일</label><input type="text" value={form.insurance_start ?? ''} placeholder="20260501" onChange={e => handleChange('insurance_start', e.target.value)} style={fieldStyles.input} /></div>
        </div>
        <div style={{ ...gridStyle(3), marginTop: 10 }}>
          <div><label style={fieldStyles.label}>보험종료일</label><input type="text" value={form.insurance_end ?? ''} placeholder="20270501" onChange={e => handleChange('insurance_end', e.target.value)} style={fieldStyles.input} /></div>
          <div><label style={fieldStyles.label}>운전자범위</label><select value={form.driver_range ?? ''} onChange={e => handleChange('driver_range', e.target.value)} style={fieldStyles.select}>{options.driverRange.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label style={fieldStyles.label}>연령제한</label><select value={form.age_limit ?? ''} onChange={e => handleChange('age_limit', e.target.value)} style={fieldStyles.select}>{options.ageLimit.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        </div>
        {(form.driver_range === '07' || form.driver_range === '08') && (
          <div style={{ ...gridStyle(3), marginTop: 10, padding: 12, background: '#f9f9fb', borderRadius: 6 }}>
            <div><label style={fieldStyles.label}>지정운전자명</label><input type="text" value={form.driver_name ?? ''} onChange={e => handleChange('driver_name', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>지정운전자 생년월일</label><input type="text" value={form.driver_birth ?? ''} placeholder="19900101" onChange={e => handleChange('driver_birth', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>지정운전자 성별</label><select value={form.driver_gender ?? ''} onChange={e => handleChange('driver_gender', e.target.value)} style={fieldStyles.select}><option value="">선택</option><option value="M">남성</option><option value="F">여성</option></select></div>
          </div>
        )}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>담보 상세</div>
          <div style={gridStyle(3)}>
            <div><label style={fieldStyles.label}>대인II</label><select value={form.dambo_d2 ?? '8'} onChange={e => handleChange('dambo_d2', e.target.value)} style={fieldStyles.select}>{options.damboD2.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>대물</label><select value={form.dambo_dm ?? '05'} onChange={e => handleChange('dambo_dm', e.target.value)} style={fieldStyles.select}>{options.damboDm.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>자손/자상</label><select value={form.dambo_js ?? '2'} onChange={e => handleChange('dambo_js', e.target.value)} style={fieldStyles.select}>{options.damboJs.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          </div>
          <div style={{ ...gridStyle(3), marginTop: 10 }}>
            <div><label style={fieldStyles.label}>무보험차</label><select value={form.dambo_mu ?? '2'} onChange={e => handleChange('dambo_mu', e.target.value)} style={fieldStyles.select}>{options.damboMu.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>자차</label><select value={form.dambo_jc ?? '2'} onChange={e => handleChange('dambo_jc', e.target.value)} style={fieldStyles.select}>{options.damboJc.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>긴급출동</label><select value={form.dambo_em ?? '1'} onChange={e => handleChange('dambo_em', e.target.value)} style={fieldStyles.select}>{options.damboEm.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          </div>
        </div>
      </div>

      {/* 섹션 4: 가입경력/사고 */}
      <div style={sectionStyle}>
        <div style={{ ...sectionTitleStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggle('career')}>
          <span>📋</span> 가입경력 / 사고이력<span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>{activeSection === 'career' ? '▲ 접기' : '▼ 펼치기'}</span>
        </div>
        {(activeSection === 'career' || activeSection === null) && (<>
          <div style={gridStyle(4)}>
            <div><label style={fieldStyles.label}>보험가입경력</label><select value={form.career_ins ?? 'B5'} onChange={e => handleChange('career_ins', e.target.value)} style={fieldStyles.select}>{options.careerIns.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>운전경력</label><select value={form.career_car ?? 'B5'} onChange={e => handleChange('career_car', e.target.value)} style={fieldStyles.select}>{options.careerIns.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>3년사고건수</label><select value={form.prev_3yr ?? '4'} onChange={e => handleChange('prev_3yr', e.target.value)} style={fieldStyles.select}>{options.prev3yr.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>할인할증등급</label><select value={form.halin_grade ?? '13Z'} onChange={e => handleChange('halin_grade', e.target.value)} style={fieldStyles.select}>{options.halinGrade.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          </div>
          <div style={{ ...gridStyle(4), marginTop: 10 }}>
            <div><label style={fieldStyles.label}>교통법규위반</label><select value={form.traffic_code ?? 'C012'} onChange={e => handleChange('traffic_code', e.target.value)} style={fieldStyles.select}>{options.trafficCode.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>위반건수</label><input type="number" value={form.traffic_count ?? 0} onChange={e => handleChange('traffic_count', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>보유대수</label><input type="number" value={form.car_count ?? 1} onChange={e => handleChange('car_count', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>물적사고 할증기준(만원)</label><input type="number" value={form.muljuk ?? 200} onChange={e => handleChange('muljuk', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
          </div>
          <div style={{ ...gridStyle(3), marginTop: 10 }}>
            <div><label style={fieldStyles.label}>3년 사고건수(보험금)</label><input type="number" value={form.acci_3yr ?? 0} onChange={e => handleChange('acci_3yr', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>1년 사고건수</label><input type="number" value={form.acci_1yr ?? 0} onChange={e => handleChange('acci_1yr', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>사고점수</label><input type="number" value={form.acci_score ?? 0} onChange={e => handleChange('acci_score', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
          </div>
        </>)}
      </div>

      {/* 섹션 5: 할인/특약 */}
      <div style={sectionStyle}>
        <div style={{ ...sectionTitleStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggle('discount')}>
          <span>💎</span> 할인 / 특약<span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>{activeSection === 'discount' ? '▲ 접기' : '▼ 펼치기'}</span>
        </div>
        {activeSection === 'discount' && (<>
          <div style={gridStyle(3)}>
            <div><label style={fieldStyles.label}>마일리지</label><select value={form.mileage ?? '0'} onChange={e => handleChange('mileage', e.target.value)} style={fieldStyles.select}>{options.mileage.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>안전운전(T맵 등)</label><select value={form.map_type ?? '0'} onChange={e => handleChange('map_type', e.target.value)} style={fieldStyles.select}>{options.mapType.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>안전운전 점수</label><input type="text" value={form.map_score ?? ''} onChange={e => handleChange('map_score', e.target.value)} style={fieldStyles.input} /></div>
          </div>
          <div style={{ ...gridStyle(3), marginTop: 10 }}>
            <div><label style={fieldStyles.label}>현대해상 특약</label><select value={form.hd_special ?? 'h01'} onChange={e => handleChange('hd_special', e.target.value)} style={fieldStyles.select}>{options.hdSpecial.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label style={fieldStyles.label}>삼성 3년경력</label><input type="text" value={form.samsung_3yr ?? ''} onChange={e => handleChange('samsung_3yr', e.target.value)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>메리츠 3년경력</label><select value={form.meritz_3yr ?? 'B5'} onChange={e => handleChange('meritz_3yr', e.target.value)} style={fieldStyles.select}>{options.meritz3yr.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          </div>
          <div style={{ ...gridStyle(2), marginTop: 10 }}>
            <div><label style={fieldStyles.label}>부품가격(만원)</label><input type="number" value={form.parts_total ?? 0} onChange={e => handleChange('parts_total', Number(e.target.value) || 0)} style={fieldStyles.input} /></div>
            <div><label style={fieldStyles.label}>할인태그 (JSON)</label><input type="text" value={JSON.stringify(form.discount_tags || {})} onChange={e => { try { handleChange('discount_tags', JSON.parse(e.target.value)); } catch {} }} style={fieldStyles.input} placeholder='{"블랙박스": true}' /></div>
          </div>
        </>)}
      </div>

      {/* 섹션 6: 메모 */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}><span>📝</span> 메모</div>
        <textarea value={form.memo || ''} onChange={e => handleChange('memo', e.target.value)} placeholder="특이사항, 고객요청 등..."
          style={{ width: '100%', minHeight: 80, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, marginBottom: 20 }}>
        <button onClick={() => onClose()} style={{ padding: '10px 30px', background: '#f0f0f0', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>취소</button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 40px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '저장중...' : '💾 견적 저장'}</button>
        <button onClick={handleCalculate} disabled={calculating} style={{ padding: '10px 40px', background: calculating ? '#95a5a6' : '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{calculating ? '⏳ 산출중...' : '🔢 보험료 산출'}</button>
      </div>
    </div>
  );
}

export default QuoteForm;
