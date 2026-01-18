// layout/Sidebar.jsx
// import React from "react";
import finBankLogo from "../finbank_logo13-removebg-preview.png";
import React, { useEffect, useState } from "react";

export default function Sidebar({ logout }) {
  const [active, setActive] = useState("home");

  const go = (screen) => {
    setActive(screen);
    window.location.hash = `#/${screen}`;
    window.dispatchEvent(
      new CustomEvent("dashboard:navigate", { detail: screen })
    );
  };

  useEffect(() => {
    const handleNavigate = (event) => {
      setActive(event.detail);
    };
    window.addEventListener("dashboard:navigate", handleNavigate);
    return () => window.removeEventListener("dashboard:navigate", handleNavigate);
  }, []);

  // export default function Sidebar({ logout }) {
  //   const go = (screen) =>
  //     window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: screen }));

  return (
    <aside className="dash-sidebar glass">
      <div>
        <img src={finBankLogo} alt="FinBank" className="dash-logo" />

        <nav className="dash-nav">
          <button
            className={active === "home" ? "nav-active" : ""}
            onClick={() => go("home")}
          >
            🏠 Home
          </button>

          <button
            className={active === "accounts" ? "nav-active" : ""}
            onClick={() => go("accounts")}
          >
            💼 Accounts
          </button>

          <button
            className={active === "transactions" ? "nav-active" : ""}
            onClick={() => go("transactions")}
          >
            💳 Transactions
          </button>

          <button
            className={active === "budgets" ? "nav-active" : ""}
            onClick={() => go("budgets")}
          >
            📊 Budgets
          </button>

          <button
            className={active === "bills" ? "nav-active" : ""}
            onClick={() => go("bills")}
          >
            🧾 Bills
          </button>

          <button
            className={active === "rewards" ? "nav-active" : ""}
            onClick={() => go("rewards")}
          >
            🎁 Rewards
          </button>

          <button
            className={active === "insights" ? "nav-active" : ""}
            onClick={() => go("insights")}
          >
            📈 Insights
          </button>

          <button
            className={active === "goals" ? "nav-active" : ""}
            onClick={() => go("goals")}
          >
            🎯 Goals
          </button>

          <button
            className={active === "settings" ? "nav-active" : ""}
            onClick={() => go("settings")}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
