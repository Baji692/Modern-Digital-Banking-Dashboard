# Database Table Setup Guide

This guide explains how to set up the three new database tables: **Rewards**, **Alerts**, and **AdminLogs**.

## Tables Overview

### 1. **Rewards Table**
Stores user reward program information and point balances.

**Fields:**
- `id` (INT, PK) - Unique identifier
- `user_id` (INT, FK to Users.id) - Reference to user
- `program_name` (VARCHAR) - Name of reward program
- `points_balance` (INT) - Current points balance
- `last_updated` (TIMESTAMP) - Last update timestamp

### 2. **Alerts Table**
Stores user notifications and alerts.

**Fields:**
- `id` (INT, PK) - Unique identifier
- `user_id` (INT, FK to Users.id) - Reference to user
- `type` (VARCHAR) - Alert type (low_balance, bill_due, budget_exceeded)
- `message` (TEXT) - Alert message content
- `created_at` (TIMESTAMP) - Creation timestamp

### 3. **AdminLogs Table**
Tracks administrative actions for audit trail.

**Fields:**
- `id` (INT, PK) - Unique identifier
- `admin_id` (INT, FK to Users.id) - Reference to admin user
- `action` (TEXT) - Action performed
- `target_type` (VARCHAR) - Type of target (user, account, transaction, etc.)
- `target_id` (INT) - ID of the target
- `timestamp` (TIMESTAMP) - Action timestamp

## Migration Options

### Option 1: Run All Migrations at Once (Recommended)
```bash
python run_migration_add_all_missing_tables.py
```

### Option 2: Run Individual Migrations
```bash
# Rewards table only
python run_migration_add_rewards_table.py

# Alerts table only
python run_migration_add_alerts_table.py

# AdminLogs table only
python run_migration_add_admin_logs_table.py
```

### Option 3: Apply via Schema Script
Run the schema.sql file directly in PostgreSQL:
```bash
psql -U postgres -d BankDashboard -f schema.sql
```

## Files Created/Modified

### New Migration Scripts
- `run_migration_add_rewards_table.py` - Creates rewards table
- `run_migration_add_alerts_table.py` - Creates alerts table
- `run_migration_add_admin_logs_table.py` - Creates admin_logs table
- `run_migration_add_all_missing_tables.py` - Creates all three tables

### Updated Files
- `schema.sql` - Updated with complete table definitions
- `models.py` - Added SQLAlchemy models for Rewards, Alerts, AdminLogs
- `schemas.py` - Added Pydantic schemas for API requests/responses
- `main.py` - Registered new API routes
- `routes/rewards.py` - Created rewards API endpoints
- `routes/alerts.py` - Created alerts API endpoints

## API Endpoints

### Rewards Endpoints
- `GET /rewards/` - Get all rewards for a user
- `GET /rewards/{reward_id}` - Get specific reward
- `POST /rewards/` - Create new reward
- `PUT /rewards/{reward_id}` - Update reward
- `DELETE /rewards/{reward_id}` - Delete reward

### Alerts Endpoints
- `GET /alerts/` - Get all alerts for a user
- `GET /alerts/{alert_id}` - Get specific alert
- `GET /alerts/type/{alert_type}` - Get alerts by type
- `POST /alerts/` - Create new alert
- `DELETE /alerts/{alert_id}` - Delete alert
- `DELETE /alerts/` - Delete all user alerts

## Example Usage

### Create a Reward
```json
POST /rewards/
{
  "user_id": 1,
  "program_name": "Platinum Points",
  "points_balance": 1000
}
```

### Create an Alert
```json
POST /alerts/
{
  "user_id": 1,
  "type": "bill_due",
  "message": "Your electricity bill is due on Jan 20"
}
```

### Log Admin Action
```python
# In your admin endpoint
from models import AdminLogs

admin_log = AdminLogs(
    admin_id=admin_id,
    action="Verified KYC",
    target_type="user",
    target_id=user_id
)
db.add(admin_log)
db.commit()
```

## Indexes

All tables have indexes created for optimal query performance:
- `rewards`: Index on `user_id`
- `alerts`: Indexes on `user_id` and `type`
- `admin_logs`: Indexes on `admin_id`, `target_type`, and `timestamp`

## Verification

After running migrations, verify tables were created:

```sql
-- Check all tables
\dt public.rewards
\dt public.alerts
\dt public.admin_logs

-- Check indexes
\di
```

## Rollback

To delete a table (if needed):
```sql
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
```
