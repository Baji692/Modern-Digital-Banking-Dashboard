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
