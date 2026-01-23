# FinBank - Modern Digital Banking Dashboard

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [System Workflow](#system-workflow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Installation & Setup](#installation--setup)
9. [Features](#features)
10. [Key Components](#key-components)

---

## 🎯 Overview

**FinBank** is a comprehensive **Modern Digital Banking Dashboard** built with a **React.js frontend** and **FastAPI backend**. It provides users with complete financial management capabilities including:

- **Account Management**: Manage multiple bank accounts
- **Transaction Tracking**: Track and categorize all transactions
- **Budget Planning**: Create, monitor, and optimize budgets
- **Bill Management**: Track and pay bills on time
- **Rewards & Redemptions**: Earn and redeem reward points
- **Financial Insights**: Get analytics and spending patterns
- **Financial Goals**: Set and track personal savings goals
- **Smart Alerts**: Receive intelligent notifications about financial events

**Target Users**: Individual customers seeking comprehensive personal finance management with modern UI/UX

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                       │
│  ├─ Dashboard (Home, Accounts, Transactions, Bills)         │
│  ├─ Budgets (Standard & Enhanced)                           │
│  ├─ Rewards & Redemptions                                   │
│  ├─ Goals (Standard & Custom)                               │
│  ├─ Analytics & Insights                                    │
│  └─ User Settings & Authentication                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST API
                   │ CORS Enabled
┌──────────────────▼──────────────────────────────────────────┐
│              BACKEND (FastAPI - Python)                      │
│  ├─ Auth Service (JWT, OTP, Password Reset)                │
│  ├─ Account Service (CRUD, Account Management)             │
│  ├─ Transaction Service (Import, Categorization)           │
│  ├─ Bill Service (Payment, Tracking)                       │
│  ├─ Budget Service (Creation, Alerts, Recommendations)     │
│  ├─ Rewards Service (Points, Redemptions, Referrals)      │
│  ├─ Goals Service (Standard & Custom Goals)                │
│  ├─ Alerts Service (Real-time Notifications)               │
│  ├─ Insights Service (Analytics & Reports)                 │
│  └─ Admin Service (Activity Logging)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ Database Driver (SQLAlchemy ORM)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│         DATABASE (PostgreSQL - BankDashboard)                │
│  ├─ Users (Authentication & Profile)                        │
│  ├─ Accounts (Bank Accounts)                                │
│  ├─ Transactions (Transaction History)                      │
│  ├─ Bills (Bill Management)                                 │
│  ├─ Budgets (Budget Planning)                               │
│  ├─ Rewards & Redemptions (Points & Rewards)               │
│  ├─ Goals (Savings Goals)                                   │
│  ├─ Alerts (Alert System)                                   │
│  └─ Admin Logs (Activity Tracking)                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Distribution

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.2.1, JavaScript/JSX, CSS3 |
| **Backend** | FastAPI, Python, SQLAlchemy ORM |
| **Database** | PostgreSQL (BankDashboard) |
| **Authentication** | JWT (JSON Web Tokens), OTP |
| **API Protocol** | REST API with CORS |
| **Security** | bcrypt (password hashing), python-jose (JWT) |

---

## 💾 Technology Stack

### Frontend Stack
```json
{
  "react": "^19.2.1",                  // UI Framework
  "react-dom": "^19.2.1",              // React DOM Rendering
  "axios": "^1.13.2",                  // HTTP Client
  "react-toastify": "^11.0.5",         // Toast Notifications
  "jspdf": "^4.0.0",                   // PDF Generation
  "html2pdf.js": "^0.14.0",            // HTML to PDF Conversion
  "react-scripts": "5.0.1"             // Build Scripts
}
```

### Backend Stack
```
fastapi                                # Web Framework
uvicorn                                # ASGI Server
python-multipart                       # Form Data Handling
pydantic                               # Data Validation
python-jose[cryptography]              # JWT Token Management
bcrypt                                 # Password Hashing
requests                               # HTTP Client
sqlalchemy                             # ORM
psycopg2-binary                        # PostgreSQL Driver
python-dotenv                          # Environment Variables
```

### Database
- **System**: PostgreSQL
- **Database Name**: `BankDashboard`
- **Default Host**: `localhost`
- **Default Port**: `5432`
- **Connection**: `postgresql://postgres:admin123@localhost/BankDashboard`

---

## 🔄 System Workflow

### Complete User Journey: End-to-End Flow

#### 1️⃣ **Authentication Flow**
```
User Launches App
    ↓
[Login Page] → Email & Password Input
    ↓
POST /auth/login
    ├─ Verify email exists
    ├─ Hash & compare password
    ├─ Generate JWT token (60 min expiry)
    └─ Return: access_token + user profile
    ↓
localStorage.setItem("finbank_user", userData)
localStorage.setItem("finbank_token", token)
    ↓
[Dashboard] ← Authenticated Session Starts
```

**Alternative: Registration Flow**
```
[Register Page] → Enter Email
    ↓
POST /auth/register/send-otp
    ├─ Generate 6-digit OTP
    ├─ Hash & store OTP (5 min expiry)
    └─ Send via email_service
    ↓
User Receives OTP Email
    ↓
[OTP Verification Page] → Enter OTP + Details
    ↓
POST /auth/register/verify-otp
    ├─ Validate OTP
    ├─ Create User record
    ├─ Create default UserGoals
    └─ Return success
    ↓
[Login Page] ← Ready to Login
```

#### 2️⃣ **Account Setup & Dashboard Navigation**
```
[Home Dashboard]
    ├─ GET /accounts/ → Display all accounts
    ├─ GET /transactions/recent → Show last 10 txns
    ├─ GET /bills/upcoming → Show unpaid bills
    ├─ GET /rewards/summary/{user_id} → Display points
    └─ GET /alerts/ → Show notifications
    ↓
User can navigate to:
├─ Accounts Page (View/Add/Edit accounts)
├─ Transactions Page (View/Import/Categorize)
├─ Bills Page (View/Pay bills)
├─ Budgets Page (Create/Monitor budgets)
├─ Rewards Page (Earn/Redeem points)
├─ Insights Page (Analytics & Reports)
├─ Goals Page (Set financial targets)
└─ Settings Page (Profile & Preferences)
```

#### 3️⃣ **Account Management Flow**
```
[Accounts Page]
    ↓
View Accounts: GET /accounts/
    └─ Returns: [List of accounts with balance]
    ↓
Add Account:
    POST /accounts/
    ├─ Input: bank_name, account_type, masked_account, balance
    ├─ Validate account_type ∈ [savings, current, credit]
    └─ Create Accounts record
    ↓
Edit Account:
    PUT /accounts/{account_id}
    ├─ Update allowed fields
    └─ Persist changes
    ↓
Delete Account:
    DELETE /accounts/{account_id}
    └─ Cascade delete related transactions
```

#### 4️⃣ **Transaction Management Flow**
```
[Transactions Page]
    ↓
View Transactions:
    GET /transactions/
    └─ Query: Accounts → Transactions (filtered by user_id)
    ↓
Import Transactions (CSV):
    POST /transactions/upload
    ├─ Parse CSV file
    ├─ Auto-categorize using CATEGORY_RULES:
    │  ├─ "Food": grocery, restaurant, swiggy, zomato
    │  ├─ "Utilities": electric, water, internet
    │  ├─ "Income": salary, credit
    │  ├─ "Shopping": amazon, flipkart
    │  └─ "Transport": uber, ola, petrol
    ├─ Create Transactions records
    └─ Update budget spent_amount
    ↓
View Recent Transactions:
    GET /transactions/recent
    └─ Return: Last 10 transactions (most recent first)
    ↓
Categorize Transaction:
    PUT /transactions/{txn_id}
    ├─ Update category
    ├─ Recalculate budget spent_amount
    └─ Return updated transaction
```

#### 5️⃣ **Budget Management Flow**
```
[Budgets Page]
    ↓
View Monthly Budgets:
    GET /budgets/
    ├─ Query budgets for current month/year
    └─ For each budget: calculate spent_amount from transactions
    ↓
Create Budget:
    POST /budgets/
    ├─ Input: category, limit_amount, month, year
    ├─ Create Budgets record
    └─ Initialize spent_amount = 0
    ↓
Monitor Spending:
    [Real-time] Calculate spent_amount:
    ├─ Query Transactions where:
    │  ├─ account_id ∈ user_accounts
    │  ├─ category = budget.category
    │  ├─ txn_date.month = budget.month
    │  └─ txn_date.year = budget.year
    ├─ Sum amounts
    └─ Display % usage
    ↓
Budget Alerts (Enhanced):
    GET /budgets-enhanced/alerts/{month}/{year}
    ├─ IF spent_amount ≥ 80% of limit → THRESHOLD_80 alert
    ├─ IF spent_amount ≥ 90% of limit → THRESHOLD_90 alert
    ├─ IF spent_amount ≥ 100% of limit → THRESHOLD_100 alert
    └─ Store in BudgetAlerts table
    ↓
Budget Recommendations:
    GET /budgets-enhanced/recommendations/{user_id}
    ├─ Analyze historical spending patterns
    ├─ Calculate average_spend for each category
    ├─ Suggest recommended_budget based on patterns
    ├─ Calculate confidence_score (0-100%)
    └─ Return recommendations
    ↓
Apply Recommendation:
    POST /budgets-enhanced/apply-recommendation/{rec_id}
    ├─ Update existing budget with recommended amount
    ├─ Mark recommendation as applied
    └─ Return success
```

#### 6️⃣ **Bill Management Flow**
```
[Bills Page]
    ↓
View Upcoming Bills:
    GET /bills/upcoming
    ├─ Query Bills where status ≠ "paid"
    └─ Sort by due_date ASC
    ↓
Create Bill:
    POST /bills/
    ├─ Input: biller_name, amount_due, due_date
    ├─ Set status = "upcoming"
    └─ Store in Bills table
    ↓
Pay Bill:
    POST /bills/{bill_id}/pay
    ├─ Input: account_id (which account to debit)
    ├─ Query Account → verify sufficient balance
    ├─ Create Transactions record (debit)
    ├─ Update Account.balance (subtract)
    ├─ Update Bills.status = "paid"
    ├─ Update Bills.paid_date = now()
    ├─ Auto-categorize as "Bills"
    └─ Send bill_reminder_email confirmation
    ↓
Smart Alerts:
    Generate at Dashboard Load:
    ├─ IF bill.due_date - today ≤ 3 days → Alert "Due Soon"
    ├─ IF bill.due_date < today → Alert "Overdue ⚠️"
    └─ Display in Home Dashboard alerts section
```

#### 7️⃣ **Rewards & Redemptions Flow**
```
[Rewards Page]
    ↓
View Rewards:
    GET /rewards/
    └─ Display all reward programs with points_balance
    ↓
Calculate Points:
    GET /rewards/summary/{user_id}
    ├─ Query all user Transactions (debits only)
    ├─ Categorize and apply rates:
    │  ├─ Shopping/Retail: 2% of amount
    │  ├─ Dining/Food: 3% of amount
    │  ├─ Utilities: 1% of amount
    │  ├─ Groceries: 1.5% of amount
    │  └─ Other: 1% of amount
    ├─ Sum total points: reward_breakdown
    ├─ Calculate reward_value = total_points ÷ 100
    └─ Return: { total_points, reward_value, breakdown }
    ↓
Redeem Rewards:
    POST /rewards/redeem
    ├─ Input: redemption_type, points_to_use
    ├─ Verify sufficient points available
    ├─ Create Redemptions record (status: "Pending")
    ├─ Deduct from available points
    ├─ Send confirmation email
    └─ Set completion status after fulfillment
    ↓
Referral Program:
    POST /rewards/referral
    ├─ Input: referred_email
    ├─ Generate unique referral_code
    ├─ Create Referrals record
    ├─ Send invitation email to referred_email
    ├─ When referred user completes KYC → bonus_points credited
    └─ Mark referral as "Completed"
```

#### 8️⃣ **Goals Management Flow**
```
[Goals Page]
    ↓
Standard Financial Goals:
    GET /goals/summary/{user_id}
    ├─ savings_goal: 20% (of income)
    ├─ spending_goal: ₹100,000 (monthly limit)
    └─ bills_goal: 100% (pay all bills on time)
    ↓
Update Goals:
    PUT /goals/update/{user_id}
    ├─ Input: New savings_goal, spending_goal, bills_goal %
    ├─ Update UserGoals record
    └─ Persist updated_at timestamp
    ↓
Custom Goals:
    GET /goals/custom/{user_id}
    ├─ Display all custom goals (status ≠ "deleted")
    └─ Sort by priority DESC, created_at DESC
    ↓
Create Custom Goal:
    POST /goals/custom
    ├─ Input: name, description, goal_type (amount/percentage)
    ├─ Fields: target_value, current_value, category, target_date
    ├─ Set: priority (low/medium/high), status ("active")
    ├─ Create CustomGoal record
    └─ Return goal details
    ↓
Progress Tracking:
    GET /goals/custom/{goal_id}/progress
    ├─ Calculate progress = current_value / target_value * 100%
    ├─ Show timeline to target_date
    └─ Display achievement status
    ↓
Complete Goal:
    PUT /goals/custom/{goal_id}/complete
    ├─ Update status = "completed"
    └─ Celebrate milestone
```

#### 9️⃣ **Insights & Analytics Flow**
```
[Insights/Analytics Page]
    ↓
Comprehensive Analytics:
    GET /insights/analytics/{user_id}
    ├─ Category Analysis:
    │  ├─ Group transactions by category
    │  └─ Calculate total per category
    ├─ Merchant Analysis:
    │  ├─ Track spending by merchant
    │  └─ Identify top merchants
    ├─ Monthly Trends:
    │  ├─ Aggregate spending for last 6 months
    │  ├─ Calculate month-over-month growth
    │  └─ Display as trend line
    ├─ Bill Summary:
    │  ├─ Total bills paid vs. upcoming
    │  ├─ Average bill amount
    │  └─ On-time payment rate
    └─ Budget Performance:
         ├─ Categories overspent
         ├─ Categories underspent
         └─ Average utilization %
    ↓
Export Data:
    GET /export/transactions/{user_id}
    ├─ Format: CSV
    └─ Include: id, date, merchant, category, amount, type
    ↓
    GET /export/redemptions/{user_id}
    ├─ Format: CSV
    └─ Include: type, points_used, amount_value, status, date
```

#### 🔟 **Alert System Flow**
```
[Alerts - Real-time]
    ↓
Smart Alerts Generated:
    ├─ Low Balance: balance < ₹5,000
    ├─ Bill Due Soon: due_date - today ≤ 3 days
    ├─ Overdue Bill: due_date < today
    ├─ Budget Threshold: spent ≥ 80%, 90%, 100%
    ├─ High Spending: unusual transaction detected
    └─ Goal Milestone: goal progress milestone reached
    ↓
Get Alerts:
    GET /alerts/?user_id={user_id}
    ├─ Return all alerts for user
    └─ Sort by created_at DESC
    ↓
Filter Alerts:
    GET /alerts/type/{alert_type}
    ├─ Filter by: "THRESHOLD_80", "LOW_BALANCE", etc.
    └─ Return matching alerts
    ↓
Dismiss Alert:
    DELETE /alerts/{alert_id}
    └─ Remove from alerts table
```

---

## 📊 Database Schema

### Core Tables

#### 1. **Users** Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,           -- bcrypt hashed
  phone VARCHAR(10) UNIQUE NOT NULL,        -- Indian format
  kyc_status ENUM('unverified', 'verified'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **Accounts** Table
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  bank_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL,        -- savings/current/credit
  masked_account VARCHAR(20) NOT NULL,      -- e.g., XXXX5678
  currency CHAR(3) DEFAULT 'INR',
  balance NUMERIC(14, 2) DEFAULT 0.00,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **Transactions** Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL → accounts(id),
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50),                     -- Auto-categorized
  merchant VARCHAR(100),
  amount NUMERIC(14, 2) NOT NULL,
  currency CHAR(3) DEFAULT 'INR',
  txn_type VARCHAR(10) NOT NULL,            -- 'debit' or 'credit'
  status VARCHAR(15) DEFAULT 'posted',
  txn_date DATETIME NOT NULL,
  posted_date DATETIME DEFAULT NOW()
);
```

#### 4. **Bills** Table
```sql
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  biller_name VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  amount_due NUMERIC(14, 2) NOT NULL,
  status VARCHAR(15) DEFAULT 'upcoming',    -- upcoming/paid/overdue
  auto_pay BOOLEAN DEFAULT FALSE,
  paid_date DATETIME,
  created_at DATETIME DEFAULT NOW()
);
```

#### 5. **Budgets** Table
```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  category VARCHAR(50) NOT NULL,
  limit_amount NUMERIC(14, 2) NOT NULL,
  spent_amount NUMERIC(14, 2) DEFAULT 0.00, -- Calculated from txns
  month INT NOT NULL,                       -- 1-12
  year INT NOT NULL,
  rollover_enabled BOOLEAN DEFAULT FALSE,
  is_spending_frozen BOOLEAN DEFAULT FALSE,
  color_code VARCHAR(20) DEFAULT 'default',
  created_at DATETIME DEFAULT NOW()
);
```

#### 6. **Budget History** Table
```sql
CREATE TABLE budget_history (
  id SERIAL PRIMARY KEY,
  budget_id INT NOT NULL,
  user_id INT NOT NULL → users(id),
  category VARCHAR(50) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  limit_amount NUMERIC(14, 2) NOT NULL,
  spent_amount NUMERIC(14, 2) DEFAULT 0.00,
  remaining_amount NUMERIC(14, 2) DEFAULT 0.00,
  usage_percent NUMERIC(5, 2) DEFAULT 0.00,
  created_at DATETIME DEFAULT NOW()
);
```

#### 7. **Budget Alerts** Table
```sql
CREATE TABLE budget_alerts (
  id SERIAL PRIMARY KEY,
  budget_id INT NOT NULL,
  user_id INT NOT NULL → users(id),
  category VARCHAR(50) NOT NULL,
  alert_type VARCHAR(20) NOT NULL,          -- THRESHOLD_80, 90, 100
  threshold_reached INT DEFAULT 0,          -- %, 80, 90, 100
  current_spending NUMERIC(14, 2) NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW()
);
```

#### 8. **Budget Recommendations** Table
```sql
CREATE TABLE budget_recommendations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  category VARCHAR(50) NOT NULL,
  current_budget NUMERIC(14, 2),
  recommended_budget NUMERIC(14, 2) NOT NULL,
  average_spend NUMERIC(14, 2) NOT NULL,
  confidence_score NUMERIC(5, 2) DEFAULT 0.00, -- 0-100%
  reasoning VARCHAR(500),
  is_applied BOOLEAN DEFAULT FALSE,
  applied_at DATETIME,
  created_at DATETIME DEFAULT NOW()
);
```

#### 9. **Rewards** Table
```sql
CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  program_name VARCHAR(100) NOT NULL,
  points_balance INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

#### 10. **Redemptions** Table
```sql
CREATE TABLE redemptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  redemption_type VARCHAR(50) NOT NULL,     -- Cashback/Gift Card/Travel
  points_used INT NOT NULL,
  amount_value NUMERIC(12, 2) NOT NULL,     -- Value in INR
  partner VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Pending',     -- Pending/Completed/Cancelled
  created_at DATETIME DEFAULT NOW(),
  completed_at DATETIME
);
```

#### 11. **User Goals** Table
```sql
CREATE TABLE user_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE → users(id),
  savings_goal NUMERIC(5, 2) DEFAULT 20.0,  -- % of income
  spending_goal NUMERIC(12, 2) DEFAULT 100000.0, -- Monthly limit
  bills_goal NUMERIC(5, 2) DEFAULT 100.0,   -- % to pay on time
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
);
```

#### 12. **Custom Goals** Table
```sql
CREATE TABLE custom_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  name VARCHAR(100) NOT NULL,               -- e.g., "Vacation Fund"
  description VARCHAR(500),
  goal_type VARCHAR(20) NOT NULL,           -- amount/percentage
  target_value NUMERIC(12, 2) NOT NULL,
  current_value NUMERIC(12, 2) DEFAULT 0,
  category VARCHAR(50) NOT NULL,            -- savings/investment/debt
  target_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',    -- low/medium/high
  status VARCHAR(20) DEFAULT 'active',      -- active/completed/paused
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
);
```

#### 13. **Referrals** Table
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INT NOT NULL → users(id),
  referred_email VARCHAR(100) NOT NULL,
  referred_user_id INT → users(id),
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  bonus_points INT DEFAULT 500,
  status VARCHAR(20) DEFAULT 'Pending',     -- Pending/Completed/Cancelled
  created_at DATETIME DEFAULT NOW(),
  completed_at DATETIME
);
```

#### 14. **Alerts** Table
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL → users(id),
  type VARCHAR(50) NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 15. **Admin Logs** Table
```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL → users(id),
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id INT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### 16. **Email OTP** Table (for Auth)
```sql
CREATE TABLE email_otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,           -- Hashed OTP
  purpose VARCHAR(50) NOT NULL,             -- register/reset
  expires_at DATETIME NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW()
);
```

**Relationships Summary**:
- 1 User → N Accounts
- 1 Account → N Transactions
- 1 User → N Bills, Budgets, Alerts, Rewards, Goals
- Budget → BudgetAlerts, BudgetHistory, BudgetRecommendations
- User → CustomGoals, Referrals, Redemptions
- Admin → AdminLogs

---

## 🔌 API Endpoints

### Base URL: `http://127.0.0.1:8000`
### Authentication: JWT Bearer Token (in Authorization header)

---

### 🔐 **AUTHENTICATION ROUTES** (`/auth`)

#### 1. Register - Send OTP
```
POST /auth/register/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP sent to email"
}
```

#### 2. Register - Verify OTP & Create User
```
POST /auth/register/verify-otp
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!",
  "otp": "123456"
}

Response: 200 OK
{
  "message": "Account created successfully"
}
```

#### 3. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "kyc_status": "unverified"
  }
}
```

#### 4. Forgot Password - Send OTP
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP sent to email"
}
```

#### 5. Reset Password - Verify OTP & Update
```
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewPass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

---

### 💳 **ACCOUNTS ROUTES** (`/accounts`)

#### 1. Get All Accounts
```
GET /accounts/
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "bank_name": "HDFC Bank",
    "account_type": "savings",
    "masked_account": "XXXX5678",
    "balance": 50000.00,
    "currency": "INR",
    "is_primary": true
  },
  ...
]
```

#### 2. Create Account
```
POST /accounts/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "bank_name": "ICICI Bank",
  "account_type": "current",
  "masked_account": "XXXX1234",
  "currency": "INR",
  "balance": 100000.00,
  "is_primary": false
}

Response: 201 Created
{
  "id": 2,
  "bank_name": "ICICI Bank",
  "account_type": "current",
  "balance": 100000.00,
  "currency": "INR",
  "is_primary": false
}
```

#### 3. Update Account
```
PUT /accounts/{account_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "balance": 75000.00,
  "is_primary": true
}

Response: 200 OK
{
  "id": 2,
  "bank_name": "ICICI Bank",
  "account_type": "current",
  "balance": 75000.00,
  "currency": "INR",
  "is_primary": true
}
```

#### 4. Delete Account
```
DELETE /accounts/{account_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Account deleted successfully"
}
```

---

### 💸 **TRANSACTIONS ROUTES** (`/transactions`)

#### 1. Get All Transactions
```
GET /transactions/
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "account_id": 1,
    "description": "Coffee at Starbucks",
    "category": "Food",
    "merchant": "Starbucks",
    "amount": 250.00,
    "currency": "INR",
    "txn_type": "debit",
    "status": "posted",
    "txn_date": "2026-01-20T10:30:00"
  },
  ...
]
```

#### 2. Get Recent Transactions (Last 10)
```
GET /transactions/recent
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  { ... 10 most recent transactions ... }
]
```

#### 3. Create Transaction
```
POST /transactions/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "account_id": 1,
  "description": "Grocery shopping",
  "merchant": "Big Basket",
  "amount": 2500.00,
  "currency": "INR",
  "txn_type": "debit",
  "txn_date": "2026-01-20T15:45:00"
}

Response: 201 Created
{
  "id": 100,
  "account_id": 1,
  "description": "Grocery shopping",
  "category": "Groceries",           ← Auto-categorized
  "merchant": "Big Basket",
  "amount": 2500.00,
  ...
}
```

#### 4. Update Transaction (Recategorize)
```
PUT /transactions/{txn_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Shopping",
  "merchant": "Updated Merchant"
}

Response: 200 OK
{ ... updated transaction ... }
```

#### 5. Upload Transactions (CSV Import)
```
POST /transactions/upload
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

File: transactions.csv
Format: id, account_id, date, merchant, category, amount, type, description

Response: 200 OK
{
  "message": "50 transactions imported successfully",
  "imported_count": 50,
  "failed_count": 0
}
```

#### 6. Delete Transaction
```
DELETE /transactions/{txn_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Transaction deleted successfully"
}
```

---

### 📋 **BILLS ROUTES** (`/bills`)

#### 1. Get Upcoming Bills (Unpaid)
```
GET /bills/upcoming
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "biller_name": "Electricity Board",
    "amount_due": 1500.00,
    "due_date": "2026-01-31",
    "status": "upcoming",
    "auto_pay": false
  },
  ...
]
```

#### 2. Get All Bills
```
GET /bills/
Headers: Authorization: Bearer {token}

Response: 200 OK
[ ... all bills (paid & unpaid) ... ]
```

#### 3. Create Bill
```
POST /bills/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "biller_name": "Internet Provider",
  "due_date": "2026-02-10",
  "amount_due": 500.00,
  "auto_pay": true
}

Response: 201 Created
{
  "id": 10,
  "biller_name": "Internet Provider",
  "amount_due": 500.00,
  "due_date": "2026-02-10",
  "status": "upcoming"
}
```

#### 4. Pay Bill
```
POST /bills/{bill_id}/pay
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "account_id": 1  ← Which account to debit from
}

Response: 200 OK
{
  "message": "Bill paid successfully",
  "bill_id": 1,
  "amount": 1500.00,
  "paid_date": "2026-01-20T14:30:00",
  "status": "paid"
}
```

#### 5. Update Bill
```
PUT /bills/{bill_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "paid",
  "amount_due": 1600.00
}

Response: 200 OK
{ ... updated bill ... }
```

#### 6. Delete Bill
```
DELETE /bills/{bill_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Bill deleted successfully"
}
```

---

### 💰 **BUDGETS ROUTES** (`/budgets` & `/budgets-enhanced`)

#### 1. Get Budgets for Month
```
GET /budgets/
Headers: Authorization: Bearer {token}

Query Parameters:
  ?month=1&year=2026

Response: 200 OK
[
  {
    "id": 1,
    "category": "Food",
    "limit_amount": 5000.00,
    "spent_amount": 3200.00,   ← Calculated from txns
    "month": 1,
    "year": 2026
  },
  ...
]
```

#### 2. Create Budget
```
POST /budgets/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Entertainment",
  "limit_amount": 2000.00,
  "month": 1,
  "year": 2026
}

Response: 201 Created
{
  "id": 5,
  "category": "Entertainment",
  "limit_amount": 2000.00,
  "spent_amount": 0.00,
  "month": 1,
  "year": 2026
}
```

#### 3. Update Budget
```
PUT /budgets/{budget_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "limit_amount": 2500.00,
  "rollover_enabled": true
}

Response: 200 OK
{ ... updated budget ... }
```

#### 4. Get Budget Insights Summary
```
GET /budgets-enhanced/insights/{month}/{year}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "total_budget": 50000.00,
  "total_spent": 35000.00,
  "remaining_amount": 15000.00,
  "overall_percent_used": 70.0,
  "overspent_categories_count": 2,
  "categories_count": 5,
  "month": 1,
  "year": 2026
}
```

#### 5. Get Budget Alerts
```
GET /budgets-enhanced/alerts/{month}/{year}
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "budget_id": 2,
    "category": "Shopping",
    "alert_type": "THRESHOLD_90",
    "threshold_reached": 90,
    "current_spending": 4500.00,
    "message": "You've reached 90% of your Shopping budget",
    "is_read": false
  },
  ...
]
```

#### 6. Get Budget Recommendations
```
GET /budgets-enhanced/recommendations/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "category": "Food",
    "current_budget": 5000.00,
    "recommended_budget": 6000.00,
    "average_spend": 5500.00,
    "confidence_score": 85.5,
    "reasoning": "Based on last 3 months spending pattern",
    "is_applied": false
  },
  ...
]
```

#### 7. Apply Recommendation
```
POST /budgets-enhanced/apply-recommendation/{recommendation_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Recommendation applied successfully",
  "new_budget_limit": 6000.00
}
```

#### 8. Delete Budget
```
DELETE /budgets/{budget_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Budget deleted successfully"
}
```

---

### 🎁 **REWARDS ROUTES** (`/rewards`)

#### 1. Get User Rewards
```
GET /rewards/
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "program_name": "Cashback Program",
    "points_balance": 5000
  },
  ...
]
```

#### 2. Get Rewards Summary
```
GET /rewards/summary/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "total_points": 8500,
  "monthly_points": 1200,
  "reward_value": 85.00,         ← (points ÷ 100)
  "reward_breakdown": {
    "shopping": 2000,
    "dining": 3500,
    "utilities": 1000,
    "groceries": 900,
    "other": 100
  },
  "available_points": 7500,       ← After pending redemptions
  "pending_redemptions": 1000
}
```

#### 3. Redeem Rewards
```
POST /rewards/redeem
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "redemption_type": "Cashback",  ← Cashback/GiftCard/Travel
  "points_to_use": 1000,
  "partner": "Amazon"
}

Response: 201 Created
{
  "id": 5,
  "user_id": 1,
  "redemption_type": "Cashback",
  "points_used": 1000,
  "amount_value": 10.00,
  "partner": "Amazon",
  "status": "Pending",
  "created_at": "2026-01-20T15:00:00"
}
```

#### 4. Create Referral
```
POST /rewards/referral
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "referred_email": "friend@example.com"
}

Response: 201 Created
{
  "id": 2,
  "referrer_id": 1,
  "referred_email": "friend@example.com",
  "referral_code": "REF123ABC",
  "bonus_points": 500,
  "status": "Pending",
  "created_at": "2026-01-20T15:00:00"
}
```

#### 5. Get Redemptions
```
GET /rewards/redemptions
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "redemption_type": "Cashback",
    "points_used": 1000,
    "amount_value": 10.00,
    "status": "Completed",
    "created_at": "2026-01-15T10:00:00"
  },
  ...
]
```

---

### 🎯 **GOALS ROUTES** (`/goals`)

#### 1. Get User Goals
```
GET /goals/summary/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "savings_goal": 20.0,              ← Save 20% of income
  "spending_goal": 100000.0,         ← Spend max ₹100,000
  "bills_goal": 100.0,               ← Pay 100% of bills on time
  "created_at": "2026-01-01T00:00:00",
  "updated_at": "2026-01-20T00:00:00"
}
```

#### 2. Create User Goals (Default)
```
POST /goals/create/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{ ... default goals created ... }
```

#### 3. Update User Goals
```
PUT /goals/update/{user_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "savings_goal": 25.0,
  "spending_goal": 80000.0,
  "bills_goal": 100.0
}

Response: 200 OK
{ ... updated goals ... }
```

#### 4. Get Custom Goals
```
GET /goals/custom/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Vacation Fund",
    "description": "Summer vacation to Europe",
    "goal_type": "amount",
    "target_value": 500000.00,
    "current_value": 120000.00,
    "category": "savings",
    "target_date": "2026-06-30",
    "priority": "high",
    "status": "active",
    "progress_percent": 24.0
  },
  ...
]
```

#### 5. Create Custom Goal
```
POST /goals/custom
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Car Fund",
  "description": "Save for new car purchase",
  "goal_type": "amount",
  "target_value": 800000.00,
  "category": "savings",
  "target_date": "2026-12-31",
  "priority": "high"
}

Response: 201 Created
{
  "id": 5,
  "user_id": 1,
  "name": "Car Fund",
  "target_value": 800000.00,
  "current_value": 0.00,
  "status": "active",
  ...
}
```

#### 6. Update Custom Goal
```
PUT /goals/custom/{goal_id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "current_value": 150000.00,
  "priority": "medium"
}

Response: 200 OK
{ ... updated goal ... }
```

#### 7. Complete Custom Goal
```
POST /goals/custom/{goal_id}/complete
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Goal marked as completed",
  "status": "completed"
}
```

#### 8. Delete Custom Goal
```
DELETE /goals/custom/{goal_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Goal deleted successfully"
}
```

---

### 📢 **ALERTS ROUTES** (`/alerts`)

#### 1. Get User Alerts
```
GET /alerts/?user_id={user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "type": "LOW_BALANCE",
    "message": "Account balance is below ₹5000",
    "created_at": "2026-01-20T14:30:00"
  },
  ...
]
```

#### 2. Get Alert by Type
```
GET /alerts/type/{alert_type}?user_id={user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
[ ... alerts matching type ... ]
```

#### 3. Create Alert
```
POST /alerts/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "BUDGET_WARNING",
  "message": "You're spending more than budgeted"
}

Response: 201 Created
{
  "id": 10,
  "type": "BUDGET_WARNING",
  "message": "...",
  "created_at": "2026-01-20T15:00:00"
}
```

#### 4. Delete Alert
```
DELETE /alerts/{alert_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Alert deleted successfully"
}
```

---

### 📊 **INSIGHTS ROUTES** (`/insights`)

#### 1. Get Financial Analytics
```
GET /insights/analytics/{user_id}
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "category_analysis": {
    "Food": 15000,
    "Shopping": 20000,
    "Utilities": 5000,
    ...
  },
  "merchant_analysis": {
    "Amazon": 12000,
    "Swiggy": 8000,
    ...
  },
  "monthly_trend": {
    "1/2026": 50000,
    "12/2025": 45000,
    ...
  },
  "total_spending": 150000.00,
  "paid_bills": 8,
  "bills_paid_amount": 12000.00,
  "overdue_bills": 1,
  "total_rewards_earned": 3500
}
```

---

### 📤 **EXPORT ROUTES** (`/export`)

#### 1. Export Transactions (CSV)
```
GET /export/transactions/{user_id}?format=csv
Headers: Authorization: Bearer {token}

Response: 200 OK
File Download: transactions_{user_id}.csv
Columns: id, account_id, date, merchant, category, amount, type, description
```

#### 2. Export Redemptions (CSV)
```
GET /export/redemptions/{user_id}?format=csv
Headers: Authorization: Bearer {token}

Response: 200 OK
File Download: redemptions_{user_id}.csv
Columns: id, type, points_used, amount_value, status, created_at, completed_at, partner
```

---

### 📝 **ADMIN LOGS ROUTES** (`/admin-logs`)

#### 1. Get Admin Logs
```
GET /admin-logs/
Headers: Authorization: Bearer {token}

Query Parameters:
  ?admin_id=1&target_type=User&days=30

Response: 200 OK
[
  {
    "id": 1,
    "admin_id": 1,
    "action": "User Account Created",
    "target_type": "User",
    "target_id": 5,
    "timestamp": "2026-01-20T14:30:00"
  },
  ...
]
```

#### 2. Get Admin Activity
```
GET /admin-logs/admin/{admin_id}?days=30
Headers: Authorization: Bearer {token}

Response: 200 OK
[ ... admin's activity logs ... ]
```

#### 3. Create Admin Log
```
POST /admin-logs/
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "Deleted User Account",
  "target_type": "User",
  "target_id": 10
}

Response: 201 Created
{ ... new log entry ... }
```

---

## 🎨 Frontend Structure

### Page Hierarchy
```
App.js (Main Router)
├─ Authentication Pages
│  ├─ LoginPage
│  ├─ RegisterOtp
│  ├─ CreateAccount
│  ├─ ResetPasswordEmail
│  ├─ ResetPasswordOtp
│  └─ ResetPasswordNewPassword
│
└─ Dashboard (DashboardLayout)
   ├─ HomeDashboard
   ├─ Accounts.jsx
   ├─ Transactions.jsx
   ├─ Bills.jsx
   ├─ Budgets.jsx
   ├─ Rewards.jsx
   ├─ Insights.jsx
   ├─ GoalsSettings.jsx
   └─ UserSettings.jsx
```

### Key Components
- **Modal.jsx**: Generic modal component
- **LoadingOverlay.jsx**: Loading spinner overlay
- **Icon.jsx**: Reusable icon component
- **BudgetEnhancedCard.jsx**: Budget display card
- **BudgetInsightsSummary.jsx**: Budget insights panel
- **BudgetAlertsPanel.jsx**: Budget alerts notification
- **BudgetRecommendationPanel.jsx**: Recommendation suggestions
- **GoalsEditModal.jsx**: Goals editing modal
- **AddCustomGoalModal.jsx**: Custom goal creation
- **BudgetHistoryChart.jsx**: Monthly budget trends

### State Management
- **localStorage**: Stores user profile & JWT token
- **React Hooks**: useState for component state
- **API Calls**: axios via api.js helper

### Styling
- **CSS Files**: Dashboard.css, Pages.css, Component-specific .css
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Professional banking theme

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v16+ (for frontend)
- **Python** 3.8+ (for backend)
- **PostgreSQL** 12+ (for database)
- **Git**

### Step 1: Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE "BankDashboard";

# Run schema
psql -U postgres -d BankDashboard -f backend/schema.sql
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:admin123@localhost/BankDashboard
JWT_SECRET_KEY=your_secret_key_here_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
EOF

# Run migrations (if needed)
python run_migration_add_all_missing_tables.py

# Start server
uvicorn main:app --reload --port 8000
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
cat > .env << EOF
REACT_APP_API_URL=http://127.0.0.1:8000
EOF

# Start development server
npm start
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

---

## ✨ Features

### 1. Authentication & Security ✓
- Email-based registration with OTP verification
- Secure login with JWT tokens
- Password reset with email OTP
- Session management
- Bcrypt password hashing

### 2. Account Management ✓
- Add/edit/delete multiple bank accounts
- View account balances
- Set primary account
- Support for Savings/Current/Credit accounts

### 3. Transaction Management ✓
- Import transactions from CSV
- Auto-categorization of transactions
- Manual recategorization
- Transaction history tracking
- Merchant tracking

### 4. Budget Management ✓
- Create monthly budgets by category
- Real-time spending tracking
- Budget alerts (80%, 90%, 100% thresholds)
- Budget recommendations based on history
- Monthly budget history
- Overspending detection

### 5. Bill Management ✓
- Add/track bills
- Pay bills from accounts
- Automatic status updates
- Bill reminders
- Payment date tracking

### 6. Rewards System ✓
- Earn points from transactions
- Category-wise point rewards:
  - Shopping/Retail: 2%
  - Dining/Food: 3%
  - Utilities: 1%
  - Groceries: 1.5%
  - Other: 1%
- Redeem points for rewards
- Referral program with bonus points

### 7. Financial Goals ✓
- Set standard goals (savings %, spending limit, bills %)
- Create custom goals with targets
- Track goal progress
- Multiple goal categories (savings, investment, debt)
- Goal priority levels
- Goal status tracking

### 8. Analytics & Insights ✓
- Category-wise spending analysis
- Merchant analysis
- Monthly spending trends (6 months)
- Bill payment analytics
- Budget performance metrics
- Data export (CSV)

### 9. Smart Alerts ✓
- Low balance warnings
- Upcoming/overdue bill alerts
- Budget threshold alerts
- Custom notifications
- Real-time notifications

### 10. Admin Functions ✓
- Admin activity logging
- Action tracking
- User management audit trail

---

## 🔧 Key Components & Services

### Backend Services

#### 1. **Auth Service** (auth.py)
- Register with OTP
- Login with JWT
- Password reset
- Token validation

#### 2. **Transaction Service** (routes/transactions.py)
- Import from CSV
- Auto-categorization
- CATEGORY_RULES mapping
- Transaction CRUD

#### 3. **Budget Service** (services/budget_service.py)
- Calculate spent amount from transactions
- Real-time spent tracking
- Overspending detection

#### 4. **Bill Service** (routes/bills.py)
- Bill CRUD operations
- Bill payment processing
- Account balance deduction
- Bill status management

#### 5. **Rewards Service** (routes/rewards.py)
- Point calculation
- Redemption processing
- Referral management
- Points tracking

#### 6. **Goals Service** (routes/goals.py)
- Standard goals management
- Custom goals CRUD
- Goal progress tracking

#### 7. **Insights Service** (routes/insights.py)
- Analytics calculation
- Category analysis
- Merchant tracking
- Trend analysis

### Frontend Services

#### 1. **API Helper** (api.js)
- Centralized API calls
- JWT token injection
- Error handling
- Base URL configuration

#### 2. **State Management** (Components)
- useState for local state
- localStorage for persistence
- useEffect for side effects

---

## 📈 Data Flow Examples

### Example 1: Create Budget & Track Spending
```
User: Create Budget for "Food" category → ₹5000 limit
├─ Backend: POST /budgets/ → Create Budgets record
│
User: Spend ₹2500 on groceries
├─ Backend: POST /transactions/ → Auto-categorizes as "Food"
│
Frontend: GET /budgets/ → Shows "Food" budget
├─ Backend Calculates:
│  ├─ Query Transactions where category = "Food", month = Jan
│  ├─ Sum amounts → ₹2500
│  └─ Calculate % = 50%
│
Response: { limit: 5000, spent: 2500, percent: 50% }
```

### Example 2: Bill Payment Workflow
```
User: Pay Bill of ₹1500 from Account
├─ POST /bills/{bill_id}/pay
│
Backend:
├─ Verify bill exists & is unpaid
├─ Query Account → Check balance ≥ ₹1500
├─ Create Transaction (debit, auto-categorized as "Bills")
├─ Update Account.balance (subtract ₹1500)
├─ Update Bills.status = "paid"
├─ Update Bills.paid_date = now()
└─ Send confirmation email
│
Response: { message: "Bill paid successfully", status: "paid" }
```

### Example 3: Reward Points Calculation
```
User: Spends ₹100 at restaurant (category: "Dining")
├─ Backend Calculates:
│  ├─ Transaction amount = ₹100
│  ├─ Category = "Dining"
│  ├─ Points = 100 × 3% = 3 points
│
User: Spends ₹200 at Amazon (category: "Shopping")
├─ Points = 200 × 2% = 4 points
│
Total Points = 3 + 4 = 7 points
Reward Value = 7 ÷ 100 = ₹0.07
```

---

## 🎓 Educational Use

This application is perfect for learning:

1. **Full-Stack Development**
   - React.js frontend development
   - FastAPI backend development
   - Database design with PostgreSQL

2. **Software Architecture**
   - MVC pattern
   - REST API design
   - Service-oriented architecture

3. **Database Design**
   - Entity-relationship modeling
   - SQL queries
   - SQLAlchemy ORM

4. **Security**
   - JWT authentication
   - Password hashing with bcrypt
   - OTP verification
   - CORS handling

5. **Financial Concepts**
   - Budget management
   - Expense tracking
   - Goal setting
   - Reward systems

---

## 📝 API Rate Limits
- No explicit rate limiting implemented
- Recommended: Implement in production

## 🔒 Security Considerations
- Passwords: bcrypt hashing with salt
- Tokens: 60-minute expiry
- OTP: 5-minute expiry, single-use
- Database: SQL injection prevention via SQLAlchemy
- CORS: Whitelist only trusted domains in production

## 🚀 Future Enhancements
- Two-factor authentication (2FA)
- Mobile app (React Native/Flutter)
- Real-time notifications (WebSockets)
- Machine learning for budget recommendations
- Advanced analytics dashboard
- Bill payment automation
- Investment tracking
- Cryptocurrency integration

---

## 📚 API Documentation
**Live API Docs**: http://localhost:8000/docs (Swagger UI)

## 🐛 Troubleshooting

### Database Connection Error
```
Error: could not connect to server
Solution: Ensure PostgreSQL is running and credentials are correct
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Ensure backend has CORS middleware configured for frontend port
```

### OTP Not Sending
```
Error: SMTPAuthenticationError
Solution: Check SMTP credentials and enable "Less Secure App Access" for Gmail
```

---

## 📞 Contact & Support
For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated**: January 20, 2026
**Version**: 1.0.0
**Status**: Production Ready

---

# 📊 Presentation Outline

## Slide 1: Title Slide
- FinBank - Modern Digital Banking Dashboard
- Team 4
- January 2026

## Slide 2: Problem Statement
- Traditional banking platforms lack modern UX
- Users need unified financial management
- Budget tracking scattered across multiple apps
- No integrated rewards system

## Slide 3: Solution Overview
- All-in-one financial management platform
- Modern, intuitive UI/UX
- Real-time analytics
- Smart alerts & recommendations
- Rewards integration

## Slide 4-5: Architecture
- Frontend: React.js
- Backend: FastAPI (Python)
- Database: PostgreSQL
- [Show architecture diagram]

## Slide 6-7: Key Features
- Account Management
- Transaction Tracking
- Budget Planning & Monitoring
- Bill Management
- Rewards & Referrals
- Financial Goals
- Analytics & Insights

## Slide 8: Tech Stack
- Frontend: React 19.2.1, Axios, CSS3
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Security: JWT, bcrypt, OTP

## Slide 9: Database Schema
- 16 core tables
- Relationships & constraints
- Support for complex financial workflows

## Slide 10-12: API Endpoints
- 50+ RESTful endpoints
- Authentication, Accounts, Transactions, Bills
- Budgets, Rewards, Goals, Insights
- [Show key endpoint examples]

## Slide 13: User Workflow
- Step 1: Registration & Authentication
- Step 2: Setup Accounts
- Step 3: Track Transactions
- Step 4: Create Budgets
- Step 5: Monitor & Optimize
- Step 6: Earn Rewards

## Slide 14: Demo
- Live application walkthrough
- Key features in action

## Slide 15: Deployment & Performance
- Ready for production deployment
- Scalable architecture
- Security best practices

## Slide 16: Future Enhancements
- Mobile app
- 2FA authentication
- AI-powered recommendations
- Investment tracking
- Cryptocurrency support

## Slide 17: Q&A
- Contact information
- Documentation
- Support channels

---

**End of Comprehensive README**
