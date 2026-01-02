import React, { createContext, useContext, useState } from "react";

/* ===============================
   BUDGET CONTEXT (IN SAME FILE)
   =============================== */

const BudgetContext = createContext();

export const useBudgets = () => useContext(BudgetContext);

/* ===============================
   INLINE CSS (INTEGRATED)
   =============================== */

const styles = {
  page: { padding: 24, background: "#f8fafc", minHeight: "100vh" },
  header: { marginBottom: 20 },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  input: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
  },
  btn: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  bar: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 6,
    marginTop: 6,
  },
};

/* ===============================
   BUDGETS COMPONENT
   =============================== */

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);

  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  /* ---- REAL-TIME FUNCTIONS ---- */

  const addBudget = () => {
    if (!name || !total) return;
    setBudgets((prev) => [
      ...prev,
      { name, total: Number(total), spent: 0 },
    ]);
    setName("");
    setTotal("");
  };

  const updateSpent = (index, value) => {
    setBudgets((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, spent: Number(value) } : b
      )
    );
  };

  /* ---- REAL-TIME CALCULATIONS ---- */

  const totalBudget = budgets.reduce((a, b) => a + b.total, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

  return (
    <BudgetContext.Provider value={{ budgets }}>
      <div style={styles.page}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2>Budgets (Real-Time)</h2>
          <p>User-driven budgeting dashboard</p>
        </div>

        {/* CREATE BUDGET */}
        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Total Budget ₹"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
          <button style={styles.btn} onClick={addBudget}>
            Add Budget
          </button>
        </div>

        {/* SUMMARY */}
        <div style={styles.card}>
          <p><b>Total Budget:</b> ₹{totalBudget}</p>
          <p><b>Total Spent:</b> ₹{totalSpent}</p>
          <p><b>Remaining:</b> ₹{totalBudget - totalSpent}</p>
        </div>

        {/* BUDGET LIST */}
        {budgets.map((b, i) => {
          const percent = (b.spent / b.total) * 100 || 0;

          return (
            <div key={i} style={styles.card}>
              <h4>{b.name}</h4>
              <p>₹{b.spent} / ₹{b.total}</p>

              <div style={styles.bar}>
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background:
                      percent >= 90 ? "#f97316" : "#22c55e",
                    borderRadius: 6,
                  }}
                />
              </div>

              <input
                style={{ ...styles.input, marginTop: 8 }}
                type="number"
                placeholder="Update spent ₹"
                onChange={(e) => updateSpent(i, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </BudgetContext.Provider>
  );
};

