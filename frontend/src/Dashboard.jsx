// Dashboard.jsx
import React, { useMemo, useRef, useState } from "react";
import "./Dashboard.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";

/* Dashboard with improved sidebar styling and functional nav buttons:
   - Dashboard -> scrolls top
   - Accounts  -> scrolls accounts section
   - Profile   -> opens small profile drawer inside dashboard
*/

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const demoAccounts = [
  { id: "acc1", bank: "Chase Bank", mask: "****1234", type: "Checking", balance: 5420.5, color: "#E8F2FF" },
  { id: "acc2", bank: "Bank of America", mask: "****5678", type: "Savings", balance: 12350.75, color: "#EFFEEC" },
  { id: "acc3", bank: "Citibank", mask: "****9012", type: "Credit Card", balance: -1250.0, color: "#FFF1F1" },
];

const demoTransactions = [
  { id: "t1", accountId: "acc1", merchant: "Whole Foods Market", category: "Food & Dining", amount: -125.5, date: "2024-12-01" },
  { id: "t2", accountId: "acc2", merchant: "Employer Inc.", category: "Income", amount: 4500.0, date: "2024-11-30" },
  { id: "t3", accountId: "acc1", merchant: "City Electric Company", category: "Utilities", amount: -89.25, date: "2024-11-28" },
  { id: "t4", accountId: "acc2", merchant: "Bank of America", category: "Income", amount: 15.5, date: "2024-12-01" },
  { id: "t5", accountId: "acc3", merchant: "Starbucks", category: "Food & Dining", amount: -5.75, date: "2024-11-27" },
];

function sumAmounts(list) {
  return list.reduce((s, it) => s + Number(it.amount || it.balance || 0), 0);
}

export default function Dashboard({ navigate }) {
  const [accounts] = useState(demoAccounts);
  const [transactions] = useState(demoTransactions);

  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  const headerRef = useRef(null);
  const accountsRef = useRef(null);
  const txRef = useRef(null);

  const filteredTx = useMemo(() => {
    let rows = transactions.slice();
    if (selectedAccountId) rows = rows.filter((t) => t.accountId === selectedAccountId);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) => (r.merchant || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q));
    }
    if (typeFilter === "income") rows = rows.filter((r) => r.amount > 0);
    if (typeFilter === "expense") rows = rows.filter((r) => r.amount < 0);
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    return rows;
  }, [transactions, selectedAccountId, query, typeFilter]);

  const totalBalance = useMemo(() =>
  sumAmounts(accounts.map((a) => ({ balance: a.balance }))),
  [accounts]
);

// Memoize the "now" value so ESLint is happy
const now = useMemo(() => new Date(), []);

const monthIncome = useMemo(() => {
  return sumAmounts(
    transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        t.amount > 0
      );
    })
  );
}, [transactions, now]);

const monthExpense = useMemo(() => {
  return Math.abs(
    sumAmounts(
      transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          t.amount < 0
        );
      })
    )
  );
}, [transactions, now]);

  const scrollTo = (target) => {
    setActiveNav(target);
    setProfileOpen(false);
    if (target === "dashboard" && headerRef.current) headerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (target === "accounts" && accountsRef.current) accountsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target === "transactions" && txRef.current) txRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSignOut = () => {
    try { localStorage.removeItem("token"); } catch (e) {}
    navigate && navigate("login");
  };

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div>
          <div className="dash-sidebar-top">
            <img src={finBankLogo} alt="FinBank" className="dash-logo" />
            <div className="dash-brand">Digital Banking</div>
          </div>

          <nav className="dash-nav" aria-label="Primary navigation">
            <button className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`} onClick={() => scrollTo("dashboard")}>
              <span className="nav-ico">🏠</span> Dashboard
            </button>

            <button className={`nav-item ${activeNav === "accounts" ? "active" : ""}`} onClick={() => scrollTo("accounts")}>
              <span className="nav-ico">💼</span> Accounts
            </button>

            <button className={`nav-item ${activeNav === "profile" ? "active" : ""}`} onClick={() => { setActiveNav("profile"); setProfileOpen((s) => !s); }}>
              <span className="nav-ico">👤</span> Profile
            </button>
          </nav>
        </div>

        <div className="dash-signout">
          <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </aside>

      <main className="dash-main">
        <section ref={headerRef} className="dash-header">
          <div>
            <h2>Welcome back, John</h2>
            <p className="sub">Manage your accounts and transactions</p>
          </div>

          <div className="profile" title="Account">
            <div className="profile-info">
              <div className="profile-email">John.doe@gmail.com</div>
              <div className="profile-badge">Verified</div>
            </div>
            <div className="profile-avatar">JD</div>
          </div>
        </section>

        <section className="summary-row">
          <div className="card summary-card">
            <div className="card-title">Total Balance</div>
            <div className="card-value">{INR.format(totalBalance)}</div>
            <div className="card-subtle">↗ +12.5% from last month</div>
          </div>

          <div className="card summary-card">
            <div className="card-title">Income (This Month)</div>
            <div className="card-value income">{INR.format(monthIncome)}</div>
            <div className="card-subtle">2 transactions</div>
          </div>

          <div className="card summary-card">
            <div className="card-title">Expenses (This Month)</div>
            <div className="card-value expense">{INR.format(monthExpense)}</div>
            <div className="card-subtle">6 transactions</div>
          </div>
        </section>

        <section ref={accountsRef} className="accounts-section">
          <h3 className="section-title">Your Accounts</h3>

          <div className="accounts-grid">
            {accounts.map((acc) => {
              const selected = selectedAccountId === acc.id;
              return (
                <div key={acc.id} className={`account-card ${selected ? "selected" : ""}`} onClick={() => setSelectedAccountId(selected ? null : acc.id)}>
                  <div className="acc-left">
                    <div className="acc-icon" style={{ background: acc.color }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="11" rx="2" stroke="#2557b9" strokeWidth="1.5"/><path d="M7 10h10" stroke="#2557b9" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <div className="acc-bank">{acc.bank}</div>
                      <div className="acc-mask">{acc.mask}</div>
                    </div>
                  </div>

                  <div className="acc-right">
                    <div className={`acc-balance ${acc.balance < 0 ? "neg" : "pos"}`}>{INR.format(acc.balance)}</div>
                    <div className="acc-type">{acc.type}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section ref={txRef} className="transactions-section">
          <div className="transactions-header">
            <h3 className="section-title">Recent Transactions</h3>

            <div className="tx-controls">
              <input className="tx-search" placeholder="Search merchant or category" value={query} onChange={(e) => setQuery(e.target.value)} />
              <select className="tx-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="tx-list">
            {filteredTx.length === 0 ? <div className="empty">No transactions found</div> : filteredTx.map((t) => (
              <div key={t.id} className="tx-row">
                <div className="tx-left">
                  <div className={`tx-icon ${t.amount > 0 ? "tx-in" : "tx-out"}`}>{t.amount > 0 ? "↑" : "↓"}</div>
                  <div>
                    <div className="tx-merchant">{t.merchant}</div>
                    <div className="tx-category">{t.category}</div>
                  </div>
                </div>

                <div className="tx-right">
                  <div className={`tx-amount ${t.amount > 0 ? "in" : "out"}`}>{t.amount > 0 ? "+" : "-"}{INR.format(Math.abs(t.amount))}</div>
                  <div className="tx-date">{new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Inline profile drawer */}
      <div className={`profile-drawer ${profileOpen ? "open" : ""}`}>
        <div className="pd-header">
          <strong>Profile</strong>
          <button className="pd-close" onClick={() => setProfileOpen(false)}>✕</button>
        </div>
        <div className="pd-body">
          <div className="pd-row"><strong>Name</strong><div>John Doe</div></div>
          <div className="pd-row"><strong>Email</strong><div>John.doe@gmail.com</div></div>
          <div className="pd-row"><strong>Status</strong><div>Verified</div></div>
          <div style={{marginTop:12}}>
            <button className="primary-button" onClick={() => { setProfileOpen(false); navigate && navigate("resetEmail"); }}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
