# 도도237 ERP 통합 설계도

> erp_v9.html (2,629줄 단일 파일) → React+TypeScript / Node.js+Express / PostgreSQL 재구성
> 작성일: 2026-04-13 | 버전: 1.0

---

## 1. 현재 상태 분석

### 1.1 erp_v9.html 구조
- **파일 형태**: 단일 HTML (CSS+JS 인라인, 2,629줄)
- **데이터 저장**: localStorage (브라우저 종속)
- **외부 연동**: 아이코원 API 프록시, 차명코드 API
- **라이브러리**: html2canvas (이미지 캡처)

### 1.2 기존 3개 탭 구성
| 탭 | 기능 | 주요 컴포넌트 |
|---|---|---|
| 견적 입력 | 고객/차량/담보/요율 입력 → API 견적 실행 | 3컬럼 레이아웃, 60+ 입력필드 |
| 견적 결과 | 보험사 비교표 + 이미지카드 + 텍스트 | 비교테이블, html2canvas, 클립보드 |
| 동일증권 | 다차량 합산 견적 | 차량 리스트, 합산 계산, 합산 이미지 |

### 1.3 기존 ERP (이미 구축 완료)
| 메뉴 | 상태 | API 엔드포인트 |
|---|---|---|
| 고객 관리 | 완료 | /api/customers (CRUD) |
| 견적/계약 | 완료 (기본) | /api/contracts (CRUD) |
| 설계사 관리 | 완료 | /api/agents (CRUD) |
| 매출/정산 | 완료 | /api/revenue (CRUD) |

---

## 2. 목표 아키텍처

### 2.1 전체 구조
```
[브라우저] ←→ [React Frontend :3000] ←→ [Node.js Backend :4000] ←→ [PostgreSQL :5432]
                                              ↕
                                     [아이코원 API 프록시]
                                     [차명코드 API]
```

### 2.2 메뉴 구조 (통합 후)
```
DODO237 ERP
├── 👤 고객 관리        (기존 유지)
├── 📋 견적/계약        (기존 유지 + 연동 강화)
├── 🔍 견적 산출 ← NEW (erp_v9 핵심 기능)
│   ├── 견적 입력
│   ├── 견적 결과
│   └── 동일증권
├── 🏢 설계사 관리      (기존 유지)
└── 💰 매출/정산        (기존 유지)
```

---

## 3. 데이터베이스 설계 (변경사항)

### 3.1 기존 테이블 (변경 없음)
- agents, customers, contracts, revenue

### 3.2 신규 테이블: quotes (견적 산출 데이터)
```sql
CREATE TABLE IF NOT EXISTS quotes (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER REFERENCES customers(id),
    agent_id        INTEGER REFERENCES agents(id),

    -- 고객 정보
    person_type     VARCHAR(10) DEFAULT 'personal',  -- personal / corp
    insured_name    VARCHAR(50) NOT NULL,
    jumin           VARCHAR(20),
    corp_name       VARCHAR(100),
    biz_no          VARCHAR(20),
    corp_no         VARCHAR(20),
    ceo_name        VARCHAR(50),
    phone           VARCHAR(20),
    prev_company    VARCHAR(20),
    prev_premium    INTEGER DEFAULT 0,

    -- 운전자 정보
    driver_range    VARCHAR(30),
    age_limit       VARCHAR(20),
    driver_name     VARCHAR(50),
    driver_birth    VARCHAR(10),
    driver_gender   VARCHAR(5),

    -- 차량 정보
    car_code        VARCHAR(20),
    car_name        VARCHAR(100),
    car_number      VARCHAR(20),
    car_year        INTEGER,
    car_price       INTEGER DEFAULT 0,
    cc              INTEGER DEFAULT 0,
    car_grade       VARCHAR(20),
    people          VARCHAR(10),
    sports          VARCHAR(10),
    airbag          VARCHAR(5) DEFAULT '0',
    abs_yn          VARCHAR(5) DEFAULT '0',
    steal_yn        VARCHAR(5) DEFAULT '0',
    transmission    VARCHAR(5),
    fuel_type       VARCHAR(5),
    outset_date     VARCHAR(10),

    -- 담보 설정
    dambo_d2        VARCHAR(10),
    dambo_dm        VARCHAR(10),
    dambo_js        VARCHAR(10),
    dambo_mu        VARCHAR(10),
    dambo_jc        VARCHAR(10),
    dambo_em        VARCHAR(10),
    insurance_start VARCHAR(10),
    insurance_end   VARCHAR(10),

    -- 보험요율사항
    career_ins      VARCHAR(10) DEFAULT 'B5',
    career_car      VARCHAR(10) DEFAULT 'B5',
    prev_3yr        VARCHAR(5) DEFAULT '4',
    halin_grade     VARCHAR(10) DEFAULT '13Z',
    traffic_code    VARCHAR(10) DEFAULT 'C012',
    traffic_count   INTEGER DEFAULT 0,
    car_count       INTEGER DEFAULT 1,
    muljuk          INTEGER DEFAULT 200,
    acci_3yr        INTEGER DEFAULT 0,
    acci_1yr        INTEGER DEFAULT 0,
    acci_score      INTEGER DEFAULT 0,

    -- 할인특약
    discount_tags   JSONB DEFAULT '{}',

    -- 맵할인 / 마일리지
    map_type        VARCHAR(10) DEFAULT '0',
    map_score       VARCHAR(10) DEFAULT '0',
    mileage         VARCHAR(10) DEFAULT '0',

    -- 보험사별 사고요율
    hd_special      VARCHAR(10) DEFAULT 'h01',
    samsung_3yr     VARCHAR(10),
    meritz_3yr      VARCHAR(10) DEFAULT 'B5',

    -- 부속품
    parts_total     INTEGER DEFAULT 0,
    parts_detail    JSONB DEFAULT '{}',

    -- 견적 결과
    result_data     JSONB DEFAULT '[]',
    -- 예시: [{"id":"samsung","name":"삼성화재","off":803700,"cm":683145,"tm":720000}, ...]

    -- 상태
    status          VARCHAR(20) DEFAULT 'draft',
    -- draft(임시) / calculated(산출완료) / sent(발송) / contracted(계약전환)

    memo            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at);
```

### 3.3 신규 테이블: multi_quotes (동일증권)
```sql
CREATE TABLE IF NOT EXISTS multi_quotes (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER REFERENCES customers(id),
    name            VARCHAR(100),
    quote_ids       JSONB DEFAULT '[]',
    -- 예시: [1, 5, 12] (quotes 테이블 ID 참조)
    result_data     JSONB DEFAULT '{}',
    status          VARCHAR(20) DEFAULT 'draft',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Backend API 설계

### 4.1 기존 API (변경 없음)
- /api/customers, /api/contracts, /api/agents, /api/revenue

### 4.2 신규 API: /api/quotes
| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/quotes | 견적 목록 (검색, 필터, 페이징) |
| GET | /api/quotes/:id | 견적 상세 |
| POST | /api/quotes | 견적 저장 |
| PUT | /api/quotes/:id | 견적 수정 |
| DELETE | /api/quotes/:id | 견적 삭제 |
| PUT | /api/quotes/:id/status | 상태 변경 |
| POST | /api/quotes/:id/convert | 견적 → 계약 전환 (contracts 테이블에 자동 생성) |

### 4.3 신규 API: /api/proxy (외부 API 프록시)
| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/proxy/carcode?q=검색어 | 차명코드 검색 (자동완성) |
| GET | /api/proxy/carcode/:code | 차명코드로 차량정보 조회 |
| POST | /api/proxy/calculate | 아이코원 API 보험료 계산 |
| GET | /api/proxy/status | API 연결 상태 확인 |

### 4.4 신규 API: /api/multi-quotes
| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/multi-quotes | 동일증권 목록 |
| POST | /api/multi-quotes | 동일증권 생성 |
| PUT | /api/multi-quotes/:id | 동일증권 수정 |
| DELETE | /api/multi-quotes/:id | 동일증권 삭제 |

---

## 5. Frontend 컴포넌트 설계

### 5.1 파일 구조
```
frontend/src/
├── App.tsx                          (메인 레이아웃 + 라우팅)
├── index.tsx                        (엔트리)
├── utils/
│   └── api.ts                       (API 유틸리티)
├── pages/
│   ├── CustomerList.tsx             (기존)
│   ├── ContractList.tsx             (기존)
│   ├── AgentList.tsx                (기존)
│   ├── RevenueList.tsx              (기존)
│   ├── QuoteCalculator.tsx    ← NEW (견적 산출 메인)
│   ├── QuoteResult.tsx        ← NEW (견적 결과)
│   └── MultiQuote.tsx         ← NEW (동일증권)
├── components/
│   ├── CustomerForm.tsx             (기존)
│   ├── ContractForm.tsx             (기존)
│   ├── AgentForm.tsx                (기존)
│   ├── RevenueForm.tsx              (기존)
│   ├── quote/                 ← NEW
│   │   ├── CustomerInfoCard.tsx     (고객 정보 입력 카드)
│   │   ├── DriverInfoCard.tsx       (운전자 정보 카드)
│   │   ├── VehicleInfoCard.tsx      (차량 정보 카드)
│   │   ├── CoverageCard.tsx         (담보 설정 카드)
│   │   ├── RateFactorsCard.tsx      (보험요율사항 카드)
│   │   ├── DiscountTags.tsx         (할인특약 태그)
│   │   ├── ChecklistCard.tsx        (입력 완성도 체크)
│   │   ├── ComparisonTable.tsx      (보험사 비교표)
│   │   ├── ImageCard.tsx            (이미지 카드 생성)
│   │   ├── KakaoTextGen.tsx         (카카오톡 텍스트)
│   │   ├── PartsModal.tsx           (부속품 팝업)
│   │   └── CarCodeSearch.tsx        (차명코드 검색)
│   └── multi/                 ← NEW
│       ├── MultiCarList.tsx         (차량 리스트)
│       └── MultiResult.tsx          (합산 결과)
```

### 5.2 컴포넌트별 상세

#### QuoteCalculator.tsx (견적 산출 메인)
- 3컬럼 그리드 레이아웃
- 컬럼1: CustomerInfoCard + DriverInfoCard
- 컬럼2: VehicleInfoCard + DiscountTags
- 컬럼3: CoverageCard + RateFactorsCard + ChecklistCard
- 상단: 요약바 (피보험자, 차량, 상태)
- 하단: "비교견적 실행" 버튼

#### QuoteResult.tsx (견적 결과)
- 서브탭: 비교표 / 이미지 / 텍스트
- ComparisonTable: CM/TM/오프라인 가격 비교
- ImageCard: html2canvas로 이미지 캡처, PNG 저장, 클립보드 복사
- KakaoTextGen: 채널별 텍스트 자동생성, 복사 버튼

#### MultiQuote.tsx (동일증권)
- 서브탭: 차량1 / 차량2 / 합산결과 / 이미지 / 텍스트
- 기존 견적에서 차량 선택 → 합산 계산

---

## 6. 데이터 흐름

### 6.1 견적 산출 흐름
```
[견적 입력] → [입력 완성도 체크] → [비교견적 실행 클릭]
    ↓
[Backend: /api/proxy/calculate] → [아이코원 API] → [보험료 결과]
    ↓
[Backend: /api/quotes POST] → [DB 저장]
    ↓
[견적 결과 페이지] → [비교표 / 이미지 / 텍스트]
```

### 6.2 견적 → 계약 전환 흐름
```
[견적 결과] → [계약 전환 버튼 클릭]
    ↓
[Backend: /api/quotes/:id/convert]
    ↓
[contracts 테이블에 새 레코드 생성]
[quotes 상태: 'contracted'로 변경]
    ↓
[견적/계약 페이지에서 확인 가능]
```

### 6.3 고객 연동 흐름
```
[고객 관리] → [견적 산출 버튼 클릭]
    ↓
[QuoteCalculator에 customer_id 전달]
    ↓
[고객 정보 자동 입력 (이름, 연락처, 차량번호)]
    ↓
[저장 시 customer_id 연결]
```

---

## 7. erp_v9.html → React 매핑 (60+ 입력필드)

### 7.1 고객 정보 (CustomerInfoCard.tsx)
| erp_v9 ID | 필드명 | 타입 | DB 컬럼 |
|---|---|---|---|
| inp-name | 피보험자 | text | insured_name |
| inp-jumin | 주민번호 | text (포맷팅) | jumin |
| inp-corpname | 법인명 | text | corp_name |
| inp-bizno | 사업자번호 | text (포맷팅) | biz_no |
| inp-corpno | 법인번호 | text | corp_no |
| inp-ceo | 대표자 | text | ceo_name |
| inp-tel | 연락처 | text (포맷팅) | phone |
| inp-prev | 전가입사 | select | prev_company |
| inp-prevprice | 전년도보험료 | number | prev_premium |
| inp-manager | 진행자 | text | (agent 연동) |
| inp-agent | 담당자 | text | (agent 연동) |
| inp-memo | 메모 | text | memo |

### 7.2 운전자 정보 (DriverInfoCard.tsx)
| erp_v9 ID | 필드명 | 타입 | DB 컬럼 |
|---|---|---|---|
| sel-drive | 운전범위 | select (14옵션) | driver_range |
| sel-age-limit | 연령선택 | select (10옵션) | age_limit |
| driver-name | 최저연령자 | text | driver_name |
| driver-birth | 생년월일 | text (6자리) | driver_birth |
| g-m / g-f | 성별 | toggle | driver_gender |

### 7.3 차량 정보 (VehicleInfoCard.tsx)
| erp_v9 ID | 필드명 | 타입 | DB 컬럼 |
|---|---|---|---|
| inp-carcode | 차명코드 | text + API검색 | car_code |
| inp-year | 연식 | text (4자리) | car_year |
| inp-carname | 차량명 | text (자동입력) | car_name |
| inp-carno | 차량번호 | text | car_number |
| inp-outset | 등록일 | text (YYYYMMDD) | outset_date |
| inp-cc | 배기량 | text (자동) | cc |
| inp-carprice | 차량가액 | number (자동) | car_price |
| inp-cargrade | 등급 | text (자동) | car_grade |
| inp-people | 인원 | text (자동) | people |
| inp-sports | 스포츠 | text (자동) | sports |
| inp-airbag | 에어백 | select | airbag |
| inp-abs | ABS | select | abs_yn |
| inp-steal | 도난방지 | select | steal_yn |
| inp-trans | 변속기 | select | transmission |
| inp-fuel | 연료 | select | fuel_type |

### 7.4 담보 설정 (CoverageCard.tsx)
| erp_v9 ID | 필드명 | 타입 | DB 컬럼 |
|---|---|---|---|
| s-d2 | 대인II | select | dambo_d2 |
| s-dm | 대물배상 | select (7옵션) | dambo_dm |
| s-js | 자기신체 | select (26옵션) | dambo_js |
| s-mu | 무보험차상해 | select | dambo_mu |
| s-jc | 자기차량손해 | select | dambo_jc |
| s-em | 긴급출동 | select (7옵션) | dambo_em |
| inp-idate-start | 시작일 | text | insurance_start |
| inp-idate-end | 종료일 | text (자동) | insurance_end |

### 7.5 보험요율사항 (RateFactorsCard.tsx)
| erp_v9 ID | 필드명 | 연동 | DB 컬럼 |
|---|---|---|---|
| s-career-ins | 가입경력(피보험자) | - | career_ins |
| s-career-car | 가입경력(차량) | → prev3yr 연동 | career_car |
| s-prev3yr | 직전3년가입경력 | 차량경력 연동 | prev_3yr |
| s-halin | 할인할증등급 | - | halin_grade |
| s-traffic | 법규위반코드 | 횟수 연동 | traffic_code |
| s-traffic-cnt | 법규위반횟수 | → 코드 연동 | traffic_count |
| s-carcount | 차량보유대수 | - | car_count |
| s-muljuk | 물적할증기준 | - | muljuk |
| s-acci3yr1 | 3년사고건수 | → 1년 연동 | acci_3yr |
| s-acci3yr2 | 1년사고건수 | 연동 | acci_1yr |
| s-acci | 사고점수합계 | - | acci_score |
| s-hd-special | 현대사고요율 | - | hd_special |
| s-samsung3yr | 삼성3년사고요율 | - | samsung_3yr |
| s-meritz3yr | 메리츠사고요율 | - | meritz_3yr |

### 7.6 할인특약 (DiscountTags.tsx)
| data-key | 항목 | API 파라미터 |
|---|---|---|
| laneout | 차선이탈경고 | lgi_laneOutGbn |
| fca | 전방충돌방지 | lgi_fcaGbn |
| blackbox_ext | 블랙박스(외장) | bbox |
| rearside | 후측방경보 | lgi_rearsideGbn |
| aroundview | 어라운드뷰 | lgi_aroundViewGbn |
| hud | HUD | lgi_hudGbn |
| cruise | 스마트크루즈 | scc |
| child_ins | 어린이보험특약 | (별도 처리) |

---

## 8. 보험사 정보 (상수 데이터)

### 8.1 보험사 목록
| ID | 보험사명 | 컬러 | CM | TM |
|---|---|---|---|---|
| samsung | 삼성화재 | #1428A0 | O | O |
| hyundai | 현대해상 | #00A651 | O | O |
| db | DB손보 | #00875A | O | O |
| kb | KB손보 | #FFC000 | O | O |
| meritz | 메리츠화재 | #ED1C24 | O | O |
| hanhwa | 한화손보 | #FF6600 | X | X |
| hana | 하나손보 | #009775 | O | O |
| heungkuk | 흥국화재 | #003DA5 | O | O |
| lotte | 롯데손보 | #ED1C24 | O | O |
| carrot | 캐롯손보 | #FF5722 | O | X |
| mg | MG손보 | #00A651 | X | X |

---

## 9. 구현 단계 (Phase)

### Phase A: DB + API 기반 (1일)
1. quotes 테이블 생성
2. /api/quotes CRUD 라우트 작성
3. /api/proxy 라우트 작성 (차명코드, 보험료 계산)
4. server.js에 라우트 등록

### Phase B: 견적 입력 화면 (2~3일)
1. QuoteCalculator.tsx 메인 페이지
2. CustomerInfoCard.tsx (개인/법인 토글)
3. DriverInfoCard.tsx (운전범위, 연령계산)
4. VehicleInfoCard.tsx (차명코드 검색, 자동입력)
5. CoverageCard.tsx (담보 설정, 프리셋)
6. RateFactorsCard.tsx (보험요율, 연동 로직)
7. DiscountTags.tsx (할인특약 토글)
8. ChecklistCard.tsx (입력 완성도)
9. App.tsx에 메뉴 추가

### Phase C: 견적 결과 화면 (1~2일)
1. QuoteResult.tsx 메인
2. ComparisonTable.tsx (CM/TM/오프라인 비교)
3. ImageCard.tsx (html2canvas 이미지 캡처)
4. KakaoTextGen.tsx (채널별 텍스트)
5. 견적 → 계약 전환 기능

### Phase D: 동일증권 (1일)
1. MultiQuote.tsx
2. MultiCarList.tsx
3. MultiResult.tsx
4. 합산 이미지/텍스트

### Phase E: 고객 연동 + 마무리 (1일)
1. 고객관리 → 견적산출 연결 버튼
2. 견적 결과 → 계약 자동전환
3. 대시보드 통계 연동
4. 전체 테스트

---

## 10. 핵심 비즈니스 로직 (erp_v9에서 이관)

### 10.1 자동 계산/연동 로직
- 주민번호 → 성별, 나이 자동계산
- 차명코드 → 차량정보 자동입력 (배기량, 등급, 인원, 안전장치)
- 차량경력 → 직전3년가입경력 연동
- 법규위반횟수 → 위반코드 연동
- 3년사고건수 → 1년사고건수 연동
- 보험시작일 → 종료일 자동계산 (+1년)
- 연령선택 → 생년월일 기반 자동산정

### 10.2 담보 프리셋
- 기본: 대인II무한, 대물10억, 자기신체3억/1억, 무보험2억, 자차가입, 긴급출동기본
- 최대: 대인II무한, 대물10억, 자기신체5억/5억, 무보험5억, 자차가입, 긴급출동고급
- 책임: 대인II무한, 대물2억, 나머지 미가입

### 10.3 CM/TM 할인율 계산
- CM = 오프라인 × (1 - CM할인율)
- TM = 오프라인 × (1 - TM할인율)
- 할인율은 보험사별로 다름 (관리자 설정 가능)

---

## 11. 기술 스택 (변경 없음)

| 구분 | 기술 | 비고 |
|---|---|---|
| Frontend | React 18 + TypeScript | 기존 유지 |
| Backend | Node.js + Express | 기존 유지 |
| Database | PostgreSQL 17 | quotes, multi_quotes 테이블 추가 |
| 인증 | JWT (예정) | 8단계에서 구현 |
| 이미지생성 | html2canvas | CDN 로드 |
| 배포 | 리눅스 서버 (예정) | 8단계에서 구현 |

---

## 12. 파일 변경 요약

### Backend 변경
| 파일 | 동작 | 설명 |
|---|---|---|
| server.js | 수정 | quotes, proxy 라우트 추가 |
| routes/quotes.js | 신규 | 견적 CRUD + 상태변경 + 계약전환 |
| routes/proxy.js | 신규 | 차명코드 검색, 보험료 계산 프록시 |
| routes/multi-quotes.js | 신규 | 동일증권 CRUD |

### Frontend 변경
| 파일 | 동작 | 설명 |
|---|---|---|
| App.tsx | 수정 | 견적산출 메뉴 추가 |
| pages/QuoteCalculator.tsx | 신규 | 견적 입력 메인 |
| pages/QuoteResult.tsx | 신규 | 견적 결과 |
| pages/MultiQuote.tsx | 신규 | 동일증권 |
| components/quote/*.tsx | 신규 | 12개 하위 컴포넌트 |
| components/multi/*.tsx | 신규 | 2개 하위 컴포넌트 |

### Database 변경
| 테이블 | 동작 | 설명 |
|---|---|---|
| quotes | 신규 | 견적 산출 데이터 (40+ 컬럼) |
| multi_quotes | 신규 | 동일증권 데이터 |

---

> **다음 단계**: 이 설계도를 기반으로 Phase A(DB + API)부터 구현 시작
