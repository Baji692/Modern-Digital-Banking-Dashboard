import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

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

      {loading && <p style={{ opacity: 0.6 }}>Loading budgets...</p>}
      {!loading && visibleBudgets.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          No budgets for selected month
        </p>
      )}

      <div className="grid">
        {visibleBudgets.map((b) => {
          const spent = Number(b.spent_amount) || 0;
          const limit = Number(b.limit_amount) || 0;
          const percent = getUsagePercent(spent, limit);

          return (
            <div key={b.id} className="glass-card">
              <strong>{b.category}</strong>

              <p>
                ₹{spent.toFixed(2)} / ₹{limit.toFixed(2)}
              </p>

              <progress
                value={spent}
                max={limit}
                className={getProgressClass(percent)}
              />

              <small style={{ opacity: 0.7 }}>
                {percent.toFixed(0)}% used · {b.month}/{b.year}
              </small>

              <div className="card-actions" style={{ marginTop: "10px" }}>
                <button
                  className="action-btn edit-btn"
                  onClick={() => openEdit(b)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => openDelete(b)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
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
    </>
  );
}
