# Quick Start: Database Setup

## Step 1: Run Migrations

Choose one of these methods:

### Method A: Run All Tables at Once (Recommended)
```bash
cd backend
python run_migration_add_all_missing_tables.py
```

### Method B: Run Individual Migrations
```bash
cd backend

# Create rewards table
python run_migration_add_rewards_table.py

# Create alerts table
python run_migration_add_alerts_table.py

# Create admin_logs table
python run_migration_add_admin_logs_table.py
```

### Method C: Using PostgreSQL Directly
```bash
psql -U postgres -d BankDashboard -f schema.sql
```

## Step 2: Verify Tables

Check that all tables were created:

```bash
# In PostgreSQL
\dt public.rewards
\dt public.alerts
\dt public.admin_logs
```

## Step 3: Restart Backend Server

```bash
cd backend
python -m uvicorn main:app --reload
```

## Step 4: Test API Endpoints

### Create a Reward
```bash
curl -X POST http://localhost:8000/rewards/ \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "program_name": "Gold Plus", "points_balance": 500}'
```

### Create an Alert
```bash
curl -X POST http://localhost:8000/alerts/ \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "type": "bill_due", "message": "Your bill is due"}'
```

### Log Admin Action
```bash
curl -X POST http://localhost:8000/admin-logs/ \
  -H "Content-Type: application/json" \
  -d '{"admin_id": 1, "action": "Verified user", "target_type": "user", "target_id": 2}'
```

## API Endpoints Summary

### Rewards
- `GET /rewards/?user_id=1` - Get user's rewards
- `POST /rewards/` - Create reward
- `PUT /rewards/{id}` - Update reward
- `DELETE /rewards/{id}` - Delete reward

### Alerts
- `GET /alerts/?user_id=1` - Get user's alerts
- `GET /alerts/type/bill_due?user_id=1` - Get specific alert type
- `POST /alerts/` - Create alert
- `DELETE /alerts/{id}` - Delete alert

### Admin Logs
- `GET /admin-logs/` - Get recent logs
- `GET /admin-logs/admin/{admin_id}` - Get admin's activity
- `GET /admin-logs/target/{target_type}/{target_id}` - Get target's logs
- `POST /admin-logs/` - Create log

## Tables Created

✅ **Rewards Table** - Stores reward program information
✅ **Alerts Table** - Stores user notifications
✅ **AdminLogs Table** - Stores admin audit trail

All tables include proper foreign keys, indexes, and timestamps for optimal performance.

## Troubleshooting

If migrations fail:
1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure `BankDashboard` database exists
4. Check table names don't already exist (or they'll be skipped if using `IF NOT EXISTS`)

See `MIGRATION_GUIDE.md` for detailed information.
