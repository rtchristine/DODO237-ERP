# 도도237 보험 ERP — 개발 지침

## 프로젝트 정보
- 프로젝트명: dodo237-erp
- 운영 중인 기존 서비스: https://reallove3340.github.io/dodo237-quote/ (절대 건드리지 말 것)

## 기술 스택 (절대 변경 금지)
- 프론트엔드: React + TypeScript
- 백엔드: Node.js + Express
- DB: PostgreSQL
- 인증: JWT 토큰

## 폴더 구조 (절대 변경 금지)
dodo237-erp/
├── frontend/   (React+TS)
├── backend/    (Node.js+Express)
└── database/   (schema.sql)


## DB 테이블 4개 (구조 변경 금지)
- customers, contracts, agents, revenue, quotes, multi_quotes

## 코딩 규칙
- 변수명: camelCase
- 파일명: kebab-case
- 주석: 한국어
- API URL: /api/리소스명 RESTful
- 에러처리: 모든 API try-catch 필수
- any 타입 금지 → 인터페이스 정의
- 서브컴포넌트 함수 내부 정의 금지 (포커스 소실 버그)

## 아키텍처 규칙
- types/ : 타입 정의
- constants/ : 상수/옵션
- utils/ : 유틸리티 함수
- hooks/ : 데이터 로직 (커스텀 훅)
- components/ : UI 컴포넌트
- pages/ : 페이지 레이아웃

## 작업 규칙
- 기존 구조에 추가만 할 것 (기존 파일 함부로 삭제 금지)
- 작업 전 반드시 현재 파일 구조 확인
- 한 번에 하나의 기능만 작업
- 전체 코드 다시 짜지 말고 수정 부분만

## 현재 개발 단계
- ✅ Phase D-1: 붙여넣기 파싱 → 폼 자동 입력
- ✅ Phase D-2: CM/TM/오프라인 3채널 보험료 비교표
- ⏳ Phase D-3: 카카오톡 문자 텍스트 생성
- ⏳ Phase D-4: 이미지 카드 생성
