import React, { useMemo, useRef, useState } from "react";
import "./Dashboard.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";

/* ================= FORMAT ================= */
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

/* ================= DEMO DATA ================= */
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

/* ================= DASHBOARD ================= */
export default function Dashboard({ navigate, user, logout }) {

  /* ===== USER DATA (FROM BACKEND) ===== */
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const avatar = displayName.charAt(0).toUpperCase();

  /* ===== STATE ===== */
  const [accounts] = useState(demoAccounts);
  const [transactions] = useState(demoTransactions);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  /* ===== REFS ===== */
  const headerRef = useRef(null);
  const accountsRef = useRef(null);
  const txRef = useRef(null);

  /* ===== FILTER TRANSACTIONS ===== */
  const filteredTx = useMemo(() => {
    let rows = transactions.slice();

    if (selectedAccountId)
      rows = rows.filter((t) => t.accountId === selectedAccountId);

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.merchant.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (typeFilter === "income") rows = rows.filter((r) => r.amount > 0);
    if (typeFilter === "expense") rows = rows.filter((r) => r.amount < 0);

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedAccountId, query, typeFilter]);

  /* ===== SUMMARY ===== */
  const totalBalance = useMemo(
    () => sumAmounts(accounts.map((a) => ({ balance: a.balance }))),
    [accounts]
  );

  const now = useMemo(() => new Date(), []);

  const monthIncome = useMemo(
    () =>
      sumAmounts(
        transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === now.getMonth() &&
                 d.getFullYear() === now.getFullYear() &&
                 t.amount > 0;
        })
      ),
    [transactions, now]
  );

  const monthExpense = useMemo(
    () =>
      Math.abs(
        sumAmounts(
          transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() &&
                   d.getFullYear() === now.getFullYear() &&
                   t.amount < 0;
          })
        )
      ),
    [transactions, now]
  );

  /* ===== SAFE SCROLL ===== */
  const scrollTo = (target) => {
    setActiveNav(target);
    setProfileOpen(false);

    if (target === "dashboard" && headerRef.current)
      headerRef.current.scrollIntoView({ behavior: "smooth" });

    if (target === "accounts" && accountsRef.current)
      accountsRef.current.scrollIntoView({ behavior: "smooth" });

    if (target === "transactions" && txRef.current)
      txRef.current.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= UI ================= */
  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div>
          <div className="dash-sidebar-top">
            <img src={finBankLogo} alt="FinBank" className="dash-logo" />
            <div className="dash-brand">Digital Banking</div>
          </div>

          <nav className="dash-nav">
            <button className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`} onClick={() => scrollTo("dashboard")}>🏠 Dashboard</button>
            <button className={`nav-item ${activeNav === "accounts" ? "active" : ""}`} onClick={() => scrollTo("accounts")}>💼 Accounts</button>
            <button className={`nav-item ${activeNav === "profile" ? "active" : ""}`} onClick={() => setProfileOpen((s) => !s)}>👤 Profile</button>
          </nav>
        </div>

        <div className="dash-signout">
          <button className="signout-btn" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <main className="dash-main">
        <section ref={headerRef} className="dash-header">
          <div>
            <h2>Welcome back, {displayName}</h2>
            <p className="sub">Manage your accounts and transactions</p>
          </div>

          <div className="profile">
            <div className="profile-info">
              <div className="profile-email">{displayEmail}</div>
              <div className="profile-badge">Verified</div>
            </div>
            <div className="profile-avatar">{avatar}</div>
          </div>
        </section>

        {/* 🔽 SUMMARY, ACCOUNTS & TRANSACTIONS (UNCHANGED UI) */}

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
      
        {/* Your existing JSX below remains EXACTLY the same */}
        {/* Accounts section */}
        {/* Transactions section */}

      </main>

      {/* PROFILE DRAWER */}
      <div className={`profile-drawer ${profileOpen ? "open" : ""}`}>
        <div className="pd-header">
          <strong>Profile</strong>
          <button className="pd-close" onClick={() => setProfileOpen(false)}>✕</button>
        </div>
        <div className="pd-body">
          <div className="pd-row"><strong>Name</strong><div>{displayName}</div></div>
          <div className="pd-row"><strong>Email</strong><div>{displayEmail}</div></div>
          <div className="pd-row"><strong>Status</strong><div>Verified</div></div>
          <button className="primary-button" onClick={() => navigate("resetEmail")}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
