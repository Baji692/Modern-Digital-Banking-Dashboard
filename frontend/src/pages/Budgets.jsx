import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import LoadingOverlay from "../components/LoadingOverlay";
import { toast } from "react-toastify";
import BudgetInsightsSummary from "../components/BudgetInsightsSummary";
import BudgetAlertsPanel from "../components/BudgetAlertsPanel";
import BudgetRecommendationPanel from "../components/BudgetRecommendationPanel";
import BudgetHistoryChart from "../components/BudgetHistoryChart";
import BudgetEnhancedCard from "../components/BudgetEnhancedCard";

const CATEGORY_OPTIONS = [
  "Food",
  "Utilities",
  "Income",
  "Shopping",
  "Transport",
  "Uncategorized",
];

export default function Budgets() {
  /* ================= STATE ================= */
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== MONTH / YEAR ===== */
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  /* ===== ADD ===== */
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  /* ===== EDIT ===== */
  const [showEdit, setShowEdit] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newLimit, setNewLimit] = useState("");

  /* ===== DELETE ===== */
  const [showDelete, setShowDelete] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);

  /* ===== ENHANCEMENTS ===== */
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drilldownTransactions, setDrilldownTransactions] = useState([]);
  const [sortBy, setSortBy] = useState("date"); // date, time, description, amount
  const [sortDirection, setSortDirection] = useState("desc"); // asc or desc (desc = latest first)
  const [hoveredColumn, setHoveredColumn] = useState(null); // track which column is hovered
  const [showHistoryChart, setShowHistoryChart] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  /* ================= LOAD ================= */
  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("get", "/budgets/");
      setBudgets(data || []);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  /* ================= FILTER (FIXED) ================= */
  const visibleBudgets = budgets.filter(
    (b) => b.month === selectedMonth && b.year === selectedYear
  );

  /* ================= HELPERS ================= */
  const getUsagePercent = (spent, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressClass = (percent) => {
    if (percent >= 100) return "budget-danger";
    if (percent >= 80) return "budget-warning";
    return "budget-safe";
  };

  /* ================= ADD ================= */
  const openAdd = () => {
    setCategory("");
    setLimitAmount("");
    setShowAdd(true);
  };

  const createBudget = async () => {
    if (!category || !limitAmount || Number(limitAmount) <= 0) {
      toast.error("Select category and valid limit");
      return;
    }

    try {
      await apiFetch("post", "/budgets/", {
        category,
        limit_amount: Number(limitAmount),
        month: selectedMonth,
        year: selectedYear,
      });

      toast.success("Budget created");
      setShowAdd(false);
      loadBudgets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= EDIT ================= */
  const openEdit = (budget) => {
    setEditingBudget(budget);
    setNewLimit(String(budget.limit_amount));
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!newLimit || Number(newLimit) <= 0) {
      toast.error("Enter valid limit");
      return;
    }

    try {
      await apiFetch("put", `/budgets/${editingBudget.id}`, {
        limit_amount: Number(newLimit),
      });

      toast.success("Budget updated");
      setShowEdit(false);
      loadBudgets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const openDelete = (budget) => {
    setDeletingBudget(budget);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await apiFetch("delete", `/budgets/${deletingBudget.id}`);
      toast.success("Budget deleted");
      setShowDelete(false);
      loadBudgets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= ENHANCEMENTS ================= */
  const handleViewTransactions = async (category) => {
    setSelectedCategory(category);
    setLoadingTransactions(true);
    try {
      const data = await apiFetch(
        "GET",
        `/budgets-enhanced/transactions/${category}/${selectedMonth}/${selectedYear}`
      );
      // Handle both array response and wrapped response
      setDrilldownTransactions(Array.isArray(data) ? data : (data.transactions || []));
      setShowTransactions(true);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Could not load transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleToggleRollover = async (budgetId) => {
    try {
      const budget = budgets.find(b => b.id === budgetId);
      if (!budget) return;

      await apiFetch("PUT", `/budgets/${budgetId}`, {
        rollover_enabled: !budget.rollover_enabled
      });
      toast.success(budget.rollover_enabled ? "Rollover disabled" : "Rollover enabled");
      loadBudgets();
    } catch (error) {
      toast.error("Could not update rollover setting");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="page-header">
        <h2 className="dash-title">Budgets</h2>

        {/* ===== MONTH / YEAR SELECTORS (STYLED) ===== */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="glass-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            className="glass-input"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button className="action-btn" onClick={openAdd}>
            Add Budget
          </button>
        </div>
      </div>

      {loading && <LoadingOverlay text="Loading budgets..." />}

      {/* ===== BUDGET ENHANCEMENTS ===== */}
      {!loading && (
        <>
          {/* Insights Summary Panel */}
          <BudgetInsightsSummary month={selectedMonth} year={selectedYear} budgets={budgets} />

          {/* Alerts Panel */}
          <BudgetAlertsPanel month={selectedMonth} year={selectedYear} />

          {/* Recommendations Panel */}
          <BudgetRecommendationPanel
            month={selectedMonth}
            year={selectedYear}
            onApply={loadBudgets}
          />

          {/* History Chart - show for selected category or first category */}
          {showHistoryChart && (
            <BudgetHistoryChart
              category={showHistoryChart}
              month={selectedMonth}
              year={selectedYear}
            />
          )}
        </>
      )}

      {!loading && visibleBudgets.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          No budgets for selected month
        </p>
      )}

      <div className="grid">
        {visibleBudgets.map((b) => (
          <BudgetEnhancedCard
            key={b.id}
            budget={b}
            onEdit={openEdit}
            onDelete={openDelete}
            onToggleRollover={handleToggleRollover}
            onViewTransactions={handleViewTransactions}
            onViewHistory={setShowHistoryChart}
          />
        ))}
      </div>

      {/* ===== ADD MODAL ===== */}
      {showAdd && (
        <Modal title="Add Budget" onClose={() => setShowAdd(false)}>
          <div className="modal-body">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Monthly limit"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
            />

            <button className="primary-button" onClick={createBudget}>
              Create Budget
            </button>
          </div>
        </Modal>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEdit && (
        <Modal title="Edit Budget" onClose={() => setShowEdit(false)}>
          <div className="modal-body">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
            />
            <button className="primary-button" onClick={saveEdit}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ===== DELETE MODAL ===== */}
      {showDelete && (
        <Modal title="Delete Budget" onClose={() => setShowDelete(false)}>
          <div className="modal-body" style={{ textAlign: "center" }}>
            <p>
              Delete budget for <strong>{deletingBudget.category}</strong>?
            </p>
            <div className="confirm-actions">
              <button className="action-btn delete-btn" onClick={confirmDelete}>
                Delete
              </button>
              <button
                className="action-btn edit-btn"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== TRANSACTION DRILLDOWN MODAL ===== */}
      {showTransactions && (
        <Modal
          title={`Transactions - ${selectedCategory}`}
          onClose={() => setShowTransactions(false)}
          className="wide-modal"
        >
          <div className="modal-body">
            {loadingTransactions ? (
              <p>Loading transactions...</p>
            ) : drilldownTransactions.length === 0 ? (
              <p>No transactions for this category</p>
            ) : (
              <>
                {/* ===== TRANSACTION TABLE WITH CLICKABLE HEADERS ===== */}
                <div style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.3) rgba(255,255,255,0.1)"
                }}
                  className="transactions-scrollbar">
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                    <thead>
                      <tr>
                        {/* DATE HEADER */}
                        <th
                          onClick={() => {
                            if (sortBy === "date") {
                              setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                            } else {
                              setSortBy("date");
                              setSortDirection("desc");
                            }
                          }}
                          onMouseEnter={() => setHoveredColumn("date")}
                          onMouseLeave={() => setHoveredColumn(null)}
                          style={{
                            textAlign: "left",
                            padding: "8px",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            minWidth: "90px",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background-color 0.2s"
                          }}
                        >
                          Date
                          {hoveredColumn === "date" && (
                            <span style={{
                              marginLeft: "6px",
                              fontSize: "0.95em",
                              color: "rgba(255,255,255,0.5)",
                              fontWeight: "normal",
                              display: "inline-block"
                            }}>
                              {sortBy === "date" ? (sortDirection === "desc" ? "↓" : "↑") : "↓"}
                            </span>
                          )}
                        </th>

                        {/* TIME HEADER */}
                        <th
                          onClick={() => {
                            if (sortBy === "time") {
                              setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                            } else {
                              setSortBy("time");
                              setSortDirection("desc");
                            }
                          }}
                          onMouseEnter={() => setHoveredColumn("time")}
                          onMouseLeave={() => setHoveredColumn(null)}
                          style={{
                            textAlign: "left",
                            padding: "8px",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            minWidth: "90px",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background-color 0.2s"
                          }}
                        >
                          Time
                          {hoveredColumn === "time" && (
                            <span style={{
                              marginLeft: "6px",
                              fontSize: "0.95em",
                              color: "rgba(255,255,255,0.5)",
                              fontWeight: "normal",
                              display: "inline-block"
                            }}>
                              {sortBy === "time" ? (sortDirection === "desc" ? "↓" : "↑") : "↓"}
                            </span>
                          )}
                        </th>

                        {/* DESCRIPTION HEADER */}
                        <th
                          onClick={() => {
                            if (sortBy === "description") {
                              setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                            } else {
                              setSortBy("description");
                              setSortDirection("asc");
                            }
                          }}
                          onMouseEnter={() => setHoveredColumn("description")}
                          onMouseLeave={() => setHoveredColumn(null)}
                          style={{
                            textAlign: "left",
                            padding: "8px",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            minWidth: "180px",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background-color 0.2s"
                          }}
                        >
                          Description
                          {hoveredColumn === "description" && (
                            <span style={{
                              marginLeft: "6px",
                              fontSize: "0.95em",
                              color: "rgba(255,255,255,0.5)",
                              fontWeight: "normal",
                              display: "inline-block"
                            }}>
                              {sortBy === "description" ? (sortDirection === "asc" ? "↑" : "↓") : "↑"}
                            </span>
                          )}
                        </th>

                        {/* AMOUNT HEADER */}
                        <th
                          onClick={() => {
                            if (sortBy === "amount") {
                              setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                            } else {
                              setSortBy("amount");
                              setSortDirection("desc");
                            }
                          }}
                          onMouseEnter={() => setHoveredColumn("amount")}
                          onMouseLeave={() => setHoveredColumn(null)}
                          style={{
                            textAlign: "right",
                            padding: "8px",
                            paddingRight: "0px",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            minWidth: "140px",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background-color 0.2s"
                          }}
                        >
                          <span style={{ marginRight: "18px" }}>Amount</span>
                          <span style={{
                            marginLeft: "4px",
                            paddingRight: "18px",

                            fontSize: "0.95em",
                            color: hoveredColumn === "amount" ? "rgba(255,255,255,0.5)" : "transparent",
                            fontWeight: "normal",
                            display: "inline-block",
                            width: "12px",
                            textAlign: "center",
                            transition: "color 0.2s"
                          }}>
                            {sortBy === "amount" ? (sortDirection === "desc" ? "↓" : "↑") : "↓"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Sort transactions based on sortBy and sortDirection
                        let sorted = [...drilldownTransactions];

                        switch (sortBy) {
                          case "date":
                            sorted.sort((a, b) => {
                              const dateA = new Date(a.date);
                              const dateB = new Date(b.date);
                              return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
                            });
                            break;
                          case "time":
                            sorted.sort((a, b) => {
                              const timeA = new Date(a.date).getTime();
                              const timeB = new Date(b.date).getTime();
                              return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
                            });
                            break;
                          case "description":
                            sorted.sort((a, b) => {
                              const result = a.description.localeCompare(b.description);
                              return sortDirection === "asc" ? result : -result;
                            });
                            break;
                          case "amount":
                            sorted.sort((a, b) => {
                              const amountA = parseFloat(a.amount);
                              const amountB = parseFloat(b.amount);
                              return sortDirection === "desc" ? amountB - amountA : amountA - amountB;
                            });
                            break;
                          default:
                            break;
                        }

                        return sorted.map((t, idx) => {
                          // Format date and time separately
                          const dateObj = new Date(t.date);
                          const formattedDate = dateObj.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });
                          const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });

                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                              <td style={{ padding: "8px", fontSize: "0.9em", whiteSpace: "nowrap" }}>{formattedDate}</td>
                              <td style={{ padding: "8px", fontSize: "0.9em", whiteSpace: "nowrap" }}>{formattedTime}</td>
                              <td style={{ padding: "8px" }}>{t.description}</td>
                              <td style={{ textAlign: "right", padding: "8px", paddingRight: "38px" }}>₹{t.amount?.toFixed(2)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
