# Phase B: 견적 입력 화면 - 설치 가이드

## 새 파일 2개 (다운로드 받아서 복사)

### 1) QuoteList.tsx → `frontend/src/pages/QuoteList.tsx`
### 2) QuoteForm.tsx → `frontend/src/components/QuoteForm.tsx`

---

## App.tsx 수정 (3군데만 수정)

### 수정 1: import 추가 (파일 상단, 4번째 import 아래에 추가)
```
import QuoteList from './pages/QuoteList';
```

### 수정 2: menuItems 배열에 견적 메뉴 추가
기존:
```
const menuItems = [
  { id: 'customers', label: '고객 관리', icon: '👤' },
  { id: 'contracts', label: '견적/계약', icon: '📋' },
  { id: 'agents', label: '설계사 관리', icon: '🏢' },
  { id: 'revenue', label: '매출/정산', icon: '💰' },
];
```

변경:
```
const menuItems = [
  { id: 'customers', label: '고객 관리', icon: '👤' },
  { id: 'quotes', label: '견적 산출', icon: '🔢' },
  { id: 'contracts', label: '계약 관리', icon: '📋' },
  { id: 'agents', label: '설계사 관리', icon: '🏢' },
  { id: 'revenue', label: '매출/정산', icon: '💰' },
];
```

### 수정 3: 페이지 렌더링에 QuoteList 추가
기존:
```
{currentPage === 'customers' && <CustomerList />}
{currentPage === 'contracts' && <ContractList />}
```

변경 (customers 아래에 한 줄 추가):
```
{currentPage === 'customers' && <CustomerList />}
{currentPage === 'quotes' && <QuoteList />}
{currentPage === 'contracts' && <ContractList />}
```

---

## Git Bash에서 실행할 명령어

```bash
cd /d/projects/dodo237-erp

# 파일 확인 (이 2개가 있어야 함)
ls frontend/src/pages/QuoteList.tsx
ls frontend/src/components/QuoteForm.tsx

# 테스트 실행
cd frontend && npm start

# 문제 없으면 커밋
cd /d/projects/dodo237-erp
git add .
git commit -m "phase-b: quote input form and list page"
git push
```

---

## Phase B 기능 요약

### QuoteList.tsx (견적 목록)
- 통계 대시보드: 전체/오늘/작성중/산출완료/발송완료/계약전환 건수
- 검색: 이름/차량번호/차종/전화번호
- 필터: 상태별 필터링
- 목록: 테이블 형태, 행 클릭 → 수정
- 액션: 발송, 계약전환, 삭제
- 페이지네이션: 20건 단위

### QuoteForm.tsx (견적 입력/수정)
- 섹션 1: 피보험자 정보 (개인/법인 전환)
- 섹션 2: 차량 정보 (차명코드, 차종, 차량번호, 연식 등)
- 섹션 3: 보험/담보 설정 (전보험사, 담보 6종)
- 섹션 4: 가입경력/사고이력 (접이식)
- 섹션 5: 할인/특약 (접이식)
- 섹션 6: 메모
