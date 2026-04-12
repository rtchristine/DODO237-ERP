import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

interface QuoteFormProps {
  quoteId: number | null;
  onClose: (saved?: boolean) => void;
}

// 기본값
const defaultForm: Record<string, any> = {
  customer_id: '', agent_id: '', person_type: 'personal',
  insured_name: '', jumin: '', phone: '',
  corp_name: '', biz_no: '', corp_no: '', ceo_name: '',
  prev_company: '', prev_premium: 0,
  driver_range: '', age_limit: '',
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
  parts_total: 0, parts_detail: {},
  status: 'draft', memo: '',
};

// 드롭다운 옵션 정의
const options = {
  personType: [
    { value: 'personal', label: '개인' },
    { value: 'corp', label: '법인' },
  ],
  prevCompany: [
    { value: '', label: '선택' },
    { value: '01', label: '삼성화재' },
    { value: '02', label: 'DB손보' },
    { value: '03', label: 'KB손보' },
    { value: '04', label: '현대해상' },
    { value: '05', label: '메리츠화재' },
    { value: '06', label: '한화손보' },
    { value: '07', label: '롯데손보' },
    { value: '08', label: 'MG손보' },
    { value: '09', label: '흥국화재' },
    { value: '10', label: 'AXA손보' },
    { value: '11', label: '캐롯손보' },
    { value: '12', label: '하나손보' },
    { value: '99', label: '신규' },
  ],
  driverRange: [
    { value: '', label: '선택' },
    { value: '01', label: '피보험자 1인' },
    { value: '02', label: '부부한정' },
    { value: '03', label: '부부+자녀(1인)' },
    { value: '04', label: '부부+자녀(2인이상)' },
    { value: '05', label: '가족한정(형제자매 포함)' },
    { value: '06', label: '누구나' },
    { value: '07', label: '부부+지정1인' },
    { value: '08', label: '부부+지정2인' },
  ],
  ageLimit: [
    { value: '', label: '선택' },
    { value: '21', label: '만21세이상' },
    { value: '22', label: '만22세이상' },
    { value: '23', label: '만23세이상' },
    { value: '24', label: '만24세이상' },
    { value: '26', label: '만26세이상' },
    { value: '30', label: '만30세이상' },
    { value: '35', label: '만35세이상' },
    { value: '43', label: '만43세이상' },
    { value: '48', label: '만48세이상' },
  ],
  transmission: [
    { value: '', label: '선택' },
    { value: '1', label: '자동' },
    { value: '2', label: '수동' },
  ],
  fuelType: [
    { value: '', label: '선택' },
    { value: '1', label: '가솔린' },
    { value: '2', label: '경유' },
    { value: '3', label: 'LPG' },
    { value: '4', label: '전기' },
    { value: '5', label: '하이브리드' },
    { value: '6', label: '수소' },
  ],
  damboD2: [
    { value: '5', label: '5천만원' },
    { value: '8', label: '1억원' },
    { value: '9', label: '2억원' },
    { value: '10', label: '3억원' },
    { value: '12', label: '5억원' },
  ],
  damboDm: [
    { value: '05', label: '5천만원' },
    { value: '10', label: '1억원' },
    { value: '15', label: '1.5억원' },
    { value: '20', label: '2억원' },
    { value: '30', label: '3억원' },
  ],
  damboJs: [
    { value: '0', label: '미가입' },
    { value: '1', label: '가입(5/3)' },
    { value: '2', label: '가입(5/5)' },
    { value: '3', label: '가입(1억)' },
  ],
  damboMu: [
    { value: '0', label: '미가입' },
    { value: '1', label: '자기부담 20만원' },
    { value: '2', label: '자기부담 50만원' },
    { value: '3', label: '자기부담 100만원' },
  ],
  damboJc: [
    { value: '0', label: '미가입' },
    { value: '1', label: '50만원' },
    { value: '2', label: '100만원' },
    { value: '3', label: '200만원' },
  ],
  damboEm: [
    { value: '0', label: '미가입' },
    { value: '1', label: '가입' },
  ],
  careerIns: [
    { value: 'A1', label: '1년이상 2년미만' },
    { value: 'A2', label: '2년이상 3년미만' },
    { value: 'B3', label: '3년이상 4년미만' },
    { value: 'B4', label: '4년이상 5년미만' },
    { value: 'B5', label: '5년이상' },
    { value: 'C0', label: '1년미만' },
    { value: 'X0', label: '없음' },
  ],
  prev3yr: [
    { value: '1', label: '1건' },
    { value: '2', label: '2건' },
    { value: '3', label: '3건' },
    { value: '4', label: '0건(무사고)' },
    { value: '5', label: '4건이상' },
  ],
  halinGrade: [
    { value: '1Z', label: '1Z (최고할인)' },
    { value: '2Z', label: '2Z' },
    { value: '3Z', label: '3Z' },
    { value: '4Z', label: '4Z' },
    { value: '5Z', label: '5Z' },
    { value: '6Z', label: '6Z' },
    { value: '7Z', label: '7Z' },
    { value: '8Z', label: '8Z' },
    { value: '9Z', label: '9Z' },
    { value: '10Z', label: '10Z' },
    { value: '11Z', label: '11Z (기본)' },
    { value: '12Z', label: '12Z' },
    { value: '13Z', label: '13Z (신규)' },
    { value: '14Z', label: '14Z' },
    { value: '15Z', label: '15Z (최고할증)' },
  ],
  trafficCode: [
    { value: 'C012', label: 'S1 (최우수)' },
    { value: 'C011', label: 'S2' },
    { value: 'C010', label: '1등급' },
    { value: 'C009', label: '2등급' },
    { value: 'C008', label: '3등급' },
    { value: 'C007', label: '4등급' },
    { value: 'C006', label: '5등급' },
    { value: 'C005', label: '6등급' },
    { value: 'C004', label: '7등급' },
    { value: 'C003', label: '8등급' },
    { value: 'C002', label: '9등급' },
    { value: 'C001', label: '10등급 (최하)' },
  ],
  mapType: [
    { value: '0', label: '미가입' },
    { value: '1', label: 'T맵' },
    { value: '2', label: '카카오내비' },
  ],
  mileage: [
    { value: '0', label: '미적용' },
    { value: '3', label: '3000km 이하' },
    { value: '5', label: '5000km 이하' },
    { value: '7', label: '7000km 이하' },
    { value: '10', label: '10000km 이하' },
    { value: '15', label: '15000km 이하' },
  ],
  hdSpecial: [
    { value: 'h01', label: '일반' },
    { value: 'h02', label: '현대해상 추가할인' },
  ],
  meritz3yr: [
    { value: 'B5', label: '5년이상' },
    { value: 'B4', label: '4년이상' },
    { value: 'B3', label: '3년이상' },
  ],
  airbag: [
    { value: '0', label: '없음' },
    { value: '1', label: '운전석' },
    { value: '2', label: '운전석+조수석' },
    { value: '3', label: '커튼에어백' },
  ],
};

// 스타일 헬퍼
const styles = {
  section: {
    background: '#fff', borderRadius: 10, border: '1px solid #eee',
    padding: '16px 20px', marginBottom: 14,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 14, fontWeight: 700 as const, color: '#1a1a2e', marginBottom: 12,
    paddingBottom: 8, borderBottom: '2px solid #6c63ff', display: 'flex',
    alignItems: 'center', gap: 6,
  } as React.CSSProperties,
  grid: (cols: number) => ({
    display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px 14px',
  }) as React.CSSProperties,
  label: {
    fontSize: 12, color: '#666', marginBottom: 3, display: 'block', fontWeight: 500 as const,
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 5,
    fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  select: {
    width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 5,
    fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

function QuoteForm({ quoteId, onClose }: QuoteFormProps) {
  const [form, setForm] = useState<Record<string, any>>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isEdit = quoteId !== null;

  // 편집 모드: 기존 데이터 로드
  useEffect(() => {
    if (quoteId) {
      (async () => {
        try {
          const data = await apiGet(`/api/quotes/${quoteId}`);
          // JSONB 필드 파싱
          if (typeof data.discount_tags === 'string') data.discount_tags = JSON.parse(data.discount_tags);
          if (typeof data.parts_detail === 'string') data.parts_detail = JSON.parse(data.parts_detail);
          if (typeof data.result_data === 'string') data.result_data = JSON.parse(data.result_data);
          setForm({ ...defaultForm, ...data });
        } catch (err) {
          alert('견적 데이터 로드 실패');
          onClose();
        }
      })();
    }
  }, [quoteId, onClose]);

  // 입력 핸들러
  const set = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!form.insured_name.trim()) {
      alert('피보험자 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await apiPut(`/api/quotes/${quoteId}`, form);
      } else {
        await apiPost('/api/quotes', form);
      }
      onClose(true);
    } catch (err) {
      alert('저장 실패');
    }
    setSaving(false);
  };

  // 섹션 토글
  const toggle = (key: string) => {
    setActiveSection(prev => prev === key ? null : key);
  };

  // 입력 필드 렌더링 헬퍼
  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label style={styles.label}>{label}</label>
      <input type={type} value={form[field] ?? ''} placeholder={placeholder}
        onChange={e => set(field, type === 'number' ? (Number(e.target.value) || 0) : e.target.value)}
        style={styles.input} />
    </div>
  );

  const Select = ({ label, field, opts }: { label: string; field: string; opts: { value: string; label: string }[] }) => (
    <div>
      <label style={styles.label}>{label}</label>
      <select value={form[field] ?? ''} onChange={e => set(field, e.target.value)} style={styles.select}>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  // 섹션 헤더 (접히는 섹션)
  const SectionHeader = ({ id, icon, title }: { id: string; icon: string; title: string }) => (
    <div style={{ ...styles.sectionTitle, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => toggle(id)}>
      <span>{icon}</span> {title}
      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>
        {activeSection === id ? '▲ 접기' : '▼ 펼치기'}
      </span>
    </div>
  );

  return (
    <div>
      {/* 상단 바 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => onClose()} style={{
            padding: '6px 14px', background: '#f0f0f0', border: 'none',
            borderRadius: 6, fontSize: 13, cursor: 'pointer',
          }}>← 목록</button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            {isEdit ? `견적 수정 #${quoteId}` : '새 견적 작성'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onClose()} style={{
            padding: '8px 20px', background: '#f0f0f0', border: 'none',
            borderRadius: 6, fontSize: 13, cursor: 'pointer',
          }}>취소</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '8px 24px', background: '#6c63ff', color: '#fff', border: 'none',
            borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>{saving ? '저장중...' : '💾 저장'}</button>
        </div>
      </div>

      {/* ===== 섹션 1: 피보험자 정보 ===== */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><span>👤</span> 피보험자 정보</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {options.personType.map(o => (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" name="person_type" checked={form.person_type === o.value}
                onChange={() => set('person_type', o.value)} />
              {o.label}
            </label>
          ))}
        </div>
        <div style={styles.grid(4)}>
          <Field label="피보험자명 *" field="insured_name" placeholder="홍길동" />
          <Field label="주민번호(앞7자리)" field="jumin" placeholder="900101-1" />
          <Field label="전화번호" field="phone" placeholder="010-1234-5678" />
          <div>
            <label style={styles.label}>담당 설계사 ID</label>
            <input type="number" value={form.agent_id || ''} placeholder="미지정"
              onChange={e => set('agent_id', e.target.value ? Number(e.target.value) : null)}
              style={styles.input} />
          </div>
        </div>
        {form.person_type === 'corp' && (
          <div style={{ ...styles.grid(4), marginTop: 10, padding: 12, background: '#f9f9fb', borderRadius: 6 }}>
            <Field label="법인명" field="corp_name" placeholder="(주)도도237" />
            <Field label="사업자번호" field="biz_no" placeholder="123-45-67890" />
            <Field label="법인번호" field="corp_no" />
            <Field label="대표자명" field="ceo_name" />
          </div>
        )}
      </div>

      {/* ===== 섹션 2: 차량 정보 ===== */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><span>🚗</span> 차량 정보</div>
        <div style={styles.grid(4)}>
          <Field label="차명코드" field="car_code" placeholder="차명코드 입력" />
          <Field label="차종명" field="car_name" placeholder="쏘나타 DN8" />
          <Field label="차량번호" field="car_number" placeholder="12가3456" />
          <Field label="연식" field="car_year" type="number" placeholder="2024" />
        </div>
        <div style={{ ...styles.grid(6), marginTop: 10 }}>
          <Field label="차량가액(만원)" field="car_price" type="number" />
          <Field label="배기량(cc)" field="cc" type="number" />
          <Field label="차량등급" field="car_grade" />
          <Field label="인승" field="people" />
          <Field label="스포츠카" field="sports" />
          <Field label="출고일" field="outset_date" placeholder="20240101" />
        </div>
        <div style={{ ...styles.grid(5), marginTop: 10 }}>
          <Select label="에어백" field="airbag" opts={options.airbag} />
          <Select label="ABS" field="abs_yn" opts={[{ value: '0', label: '없음' }, { value: '1', label: '있음' }]} />
          <Select label="도난방지" field="steal_yn" opts={[{ value: '0', label: '없음' }, { value: '1', label: '있음' }]} />
          <Select label="변속기" field="transmission" opts={options.transmission} />
          <Select label="연료" field="fuel_type" opts={options.fuelType} />
        </div>
      </div>

      {/* ===== 섹션 3: 보험/담보 설정 ===== */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><span>🛡️</span> 보험/담보 설정</div>
        <div style={styles.grid(3)}>
          <Select label="전보험사" field="prev_company" opts={options.prevCompany} />
          <Field label="전보험료" field="prev_premium" type="number" />
          <Field label="보험시작일" field="insurance_start" placeholder="20260501" />
        </div>
        <div style={{ ...styles.grid(3), marginTop: 10 }}>
          <Field label="보험종료일" field="insurance_end" placeholder="20270501" />
          <Select label="운전자범위" field="driver_range" opts={options.driverRange} />
          <Select label="연령제한" field="age_limit" opts={options.ageLimit} />
        </div>
        {(form.driver_range === '07' || form.driver_range === '08') && (
          <div style={{ ...styles.grid(3), marginTop: 10, padding: 12, background: '#f9f9fb', borderRadius: 6 }}>
            <Field label="지정운전자명" field="driver_name" />
            <Field label="지정운전자 생년월일" field="driver_birth" placeholder="19900101" />
            <Select label="지정운전자 성별" field="driver_gender" opts={[
              { value: '', label: '선택' }, { value: 'M', label: '남성' }, { value: 'F', label: '여성' },
            ]} />
          </div>
        )}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>담보 상세</div>
          <div style={styles.grid(3)}>
            <Select label="대인II" field="dambo_d2" opts={options.damboD2} />
            <Select label="대물" field="dambo_dm" opts={options.damboDm} />
            <Select label="자손/자상" field="dambo_js" opts={options.damboJs} />
          </div>
          <div style={{ ...styles.grid(3), marginTop: 10 }}>
            <Select label="무보험차" field="dambo_mu" opts={options.damboMu} />
            <Select label="자차" field="dambo_jc" opts={options.damboJc} />
            <Select label="긴급출동" field="dambo_em" opts={options.damboEm} />
          </div>
        </div>
      </div>

      {/* ===== 섹션 4: 가입경력/사고 (접이식) ===== */}
      <div style={styles.section}>
        <SectionHeader id="career" icon="📋" title="가입경력 / 사고이력" />
        {(activeSection === 'career' || activeSection === null) && (
          <>
            <div style={styles.grid(4)}>
              <Select label="보험가입경력" field="career_ins" opts={options.careerIns} />
              <Select label="운전경력" field="career_car" opts={options.careerIns} />
              <Select label="3년사고건수" field="prev_3yr" opts={options.prev3yr} />
              <Select label="할인할증등급" field="halin_grade" opts={options.halinGrade} />
            </div>
            <div style={{ ...styles.grid(4), marginTop: 10 }}>
              <Select label="교통법규위반" field="traffic_code" opts={options.trafficCode} />
              <Field label="위반건수" field="traffic_count" type="number" />
              <Field label="보유대수" field="car_count" type="number" />
              <Field label="물적사고 할증기준(만원)" field="muljuk" type="number" />
            </div>
            <div style={{ ...styles.grid(3), marginTop: 10 }}>
              <Field label="3년 사고건수(보험금)" field="acci_3yr" type="number" />
              <Field label="1년 사고건수" field="acci_1yr" type="number" />
              <Field label="사고점수" field="acci_score" type="number" />
            </div>
          </>
        )}
      </div>

      {/* ===== 섹션 5: 할인/특약 (접이식) ===== */}
      <div style={styles.section}>
        <SectionHeader id="discount" icon="💎" title="할인 / 특약" />
        {activeSection === 'discount' && (
          <>
            <div style={styles.grid(3)}>
              <Select label="마일리지" field="mileage" opts={options.mileage} />
              <Select label="안전운전(T맵 등)" field="map_type" opts={options.mapType} />
              <Field label="안전운전 점수" field="map_score" />
            </div>
            <div style={{ ...styles.grid(3), marginTop: 10 }}>
              <Select label="현대해상 특약" field="hd_special" opts={options.hdSpecial} />
              <Field label="삼성 3년경력" field="samsung_3yr" />
              <Select label="메리츠 3년경력" field="meritz_3yr" opts={options.meritz3yr} />
            </div>
            <div style={{ ...styles.grid(2), marginTop: 10 }}>
              <Field label="부품가격(만원)" field="parts_total" type="number" />
              <div>
                <label style={styles.label}>할인태그 (JSON)</label>
                <input type="text" value={JSON.stringify(form.discount_tags || {})}
                  onChange={e => { try { set('discount_tags', JSON.parse(e.target.value)); } catch {} }}
                  style={styles.input} placeholder='{"블랙박스": true}' />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== 섹션 6: 메모 ===== */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><span>📝</span> 메모</div>
        <textarea value={form.memo || ''} onChange={e => set('memo', e.target.value)}
          placeholder="특이사항, 고객요청 등..."
          style={{
            width: '100%', minHeight: 80, padding: '8px 12px', border: '1px solid #ddd',
            borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical',
            boxSizing: 'border-box', fontFamily: 'inherit',
          }} />
      </div>

      {/* 하단 저장 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, marginBottom: 20 }}>
        <button onClick={() => onClose()} style={{
          padding: '10px 30px', background: '#f0f0f0', border: 'none',
          borderRadius: 8, fontSize: 14, cursor: 'pointer',
        }}>취소</button>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '10px 40px', background: '#6c63ff', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          opacity: saving ? 0.6 : 1,
        }}>{saving ? '저장중...' : '💾 견적 저장'}</button>
      </div>
    </div>
  );
}

export default QuoteForm;
