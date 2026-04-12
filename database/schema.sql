-- ============================================
-- 도도237 보험 ERP 데이터베이스 스키마
-- DB: PostgreSQL
-- 테이블: customers, contracts, agents, revenue
-- ============================================

-- 1. 설계사/직원 테이블
CREATE TABLE IF NOT EXISTS agents (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(100),
    position        VARCHAR(30) DEFAULT '설계사',
    status          VARCHAR(10) DEFAULT 'active',
    hire_date       DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 고객 정보 테이블
CREATE TABLE IF NOT EXISTS customers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    phone           VARCHAR(20),
    car_number      VARCHAR(20),
    car_model       VARCHAR(100),
    car_year        INTEGER,
    birthdate       DATE,
    gender          VARCHAR(5),
    address         TEXT,
    memo            TEXT,
    agent_id        INTEGER REFERENCES agents(id),
    source          VARCHAR(30) DEFAULT 'direct',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 견적/계약 테이블
CREATE TABLE IF NOT EXISTS contracts (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    agent_id        INTEGER REFERENCES agents(id),
    quote_type      VARCHAR(10) DEFAULT 'CM',
    insurance_company VARCHAR(50),
    premium         INTEGER DEFAULT 0,
    discount_rate   DECIMAL(5,2) DEFAULT 0,
    coverage_type   VARCHAR(20) DEFAULT '기본',
    driver_range    VARCHAR(50),
    age_range       VARCHAR(30),
    insurance_period VARCHAR(30),
    previous_company VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'quote',
    contract_date   DATE,
    start_date      DATE,
    end_date        DATE,
    memo            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 매출/정산 테이블
CREATE TABLE IF NOT EXISTS revenue (
    id              SERIAL PRIMARY KEY,
    contract_id     INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    agent_id        INTEGER REFERENCES agents(id),
    revenue_type    VARCHAR(20) DEFAULT 'commission',
    amount          INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    payment_status  VARCHAR(20) DEFAULT 'pending',
    payment_date    DATE,
    period_year     INTEGER,
    period_month    INTEGER,
    memo            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_customers_agent ON customers(agent_id);
CREATE INDEX idx_customers_car ON customers(car_number);
CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_date ON contracts(contract_date);
CREATE INDEX idx_revenue_agent ON revenue(agent_id);
CREATE INDEX idx_revenue_period ON revenue(period_year, period_month);
CREATE INDEX idx_revenue_status ON revenue(payment_status);
