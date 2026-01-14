CREATE DATABASE "BankDashboard";
\c "BankDashboard";

CREATE TYPE kyc_status_enum AS ENUM ('unverified', 'verified');

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    kyc_status kyc_status_enum DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE public.accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    masked_account VARCHAR(50) NOT NULL,
    currency CHAR(3) DEFAULT 'INR',
    balance NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'INR',
    txn_type VARCHAR(10) NOT NULL,
    merchant VARCHAR(100),
    txn_date TIMESTAMP NOT NULL,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    limit_amount NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.bills (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    biller_name VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming',
    auto_pay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.rewards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    program_name VARCHAR(100) NOT NULL,
    points_balance INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.alerts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);