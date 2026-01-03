import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [visibleAccountId, setVisibleAccountId] = useState(null);

  const user = JSON.parse(localStorage.getItem("finbank_user"));

  const [form, setForm] = useState({
    bank_name: "",
    account_type: "savings",
    masked_account: "",
    balance: "",
    is_primary: false,
  });

  /* ================= LOAD DATA ================= */

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("get", "/accounts/");
      setAccounts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const data = await apiFetch("get", "/transactions/recent");
      setRecentTransactions(data || []);
    } catch {
      setRecentTransactions([]);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadRecentTransactions();
  }, []);

  /* ================= ACCOUNT CRUD ================= */

  const openCreate = () => {
    setEditing(null);
    setForm({
      bank_name: "",
      account_type: "savings",
      masked_account: "",
      balance: "",
      is_primary: false,
    });
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setForm({
      bank_name: acc.bank_name || "",
      account_type: acc.account_type || "savings",
      masked_account: acc.masked_account || "",
      balance:
        acc.balance !== undefined && acc.balance !== null
          ? String(acc.balance)
          : "",
      is_primary: acc.is_primary || false,
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.bank_name.trim()) {
      toast.error("Bank name is required");
      return;
    }

    const payload = {
      user_id: user.id,
      bank_name: form.bank_name.trim(),
      account_type: form.account_type,
      masked_account:
        form.masked_account.trim() !== ""
          ? form.masked_account.trim()
          : editing?.masked_account,
      balance:
        form.balance !== "" && !isNaN(form.balance)
          ? parseFloat(form.balance)
          : editing?.balance,
      currency: editing?.currency || "INR",
      is_primary: form.is_primary,
    };

    try {
      if (editing) {
        await apiFetch("put", `/accounts/${editing.id}/`, payload);
        toast.success("Account updated successfully");
      } else {
        await apiFetch("post", "/accounts/", payload);
        toast.success("Account created successfully");
      }

      setShowModal(false);
      loadAccounts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = (acc) => {
    setDeleting(acc);
    setShowDelete(true);
  };

  const deleteAccount = async () => {
    try {
      await apiFetch("delete", `/accounts/${deleting.id}/`);
      toast.success("Account deleted successfully");
      setShowDelete(false);
      loadAccounts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const maskAccountNumber = (value) => {
    if (!value) return "";
    return value.replace(/.(?=.{4})/g, "*");
  };

  /* ================= FILTERED TRANSACTIONS ================= */

  const displayedTransactions = selectedAccount
    ? recentTransactions.filter(
        (t) => t.bank_name === selectedAccount.bank_name
      )
    : recentTransactions;

  if (loading) return <p>Loading accounts...</p>;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Accounts</h1>
        <button className="action-btn" onClick={openCreate}>
          ➕ Add Account
        </button>
      </div>

      {/* ===== ACCOUNT CARDS (3 PER ROW) ===== */}
      <div className="cards-grid three-col">
        {accounts.map((a) => (
          <div
            key={a.id}
            className={`glass-card ${
              selectedAccount?.id === a.id ? "active-card" : ""
            }`}
            onClick={() =>
              setSelectedAccount(
                selectedAccount?.id === a.id ? null : a
              )
            }
          >
            <h3>{a.bank_name}</h3>
            <p>{a.account_type}</p>

            <p>
              {visibleAccountId === a.id
                ? a.masked_account
                : maskAccountNumber(a.masked_account)}
              <button
                className="eye-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleAccountId(
                    visibleAccountId === a.id ? null : a.id
                  );
                }}
              >
                {visibleAccountId === a.id ? "🙈" : "👁️"}
              </button>
            </p>

            <p>₹ {a.balance}</p>

            <div className="card-actions">
              <button
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(a);
                }}
              >
                Edit
              </button>

              <button
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(a);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== RECENT TRANSACTIONS TABLE ===== */}
      <section style={{ marginTop: "30px" }}>
        <h3 className="section-title">
          Recent Transactions{" "}
          {selectedAccount && `(${selectedAccount.bank_name})`}
        </h3>

        <div className="glass-card">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              {displayedTransactions.slice(0, 5).map((t) => (
                <tr key={t.id}>
                  <td>
                    {new Date(t.txn_date).toLocaleDateString()}
                  </td>
                  <td>{t.description}</td>
                  <td>{t.merchant || "-"}</td>
                  <td
                    className={
                      t.txn_type === "credit"
                        ? "amount credit"
                        : "amount debit"
                    }
                  >
                    ₹ {t.amount}
                  </td>
                  <td>{t.txn_type}</td>
                </tr>
              ))}

              {displayedTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== MODALS (UNCHANGED) ===== */}
      {showModal && (
        <Modal
          title={editing ? "Edit Account" : "Create Account"}
          onClose={() => setShowModal(false)}
        >
          <div className="modal-body">
            <input
              placeholder="Bank Name"
              value={form.bank_name}
              onChange={(e) =>
                setForm({ ...form, bank_name: e.target.value })
              }
            />

            <select
              value={form.account_type}
              onChange={(e) =>
                setForm({ ...form, account_type: e.target.value })
              }
            >
              <option value="savings">Savings</option>
              <option value="current">Current</option>
              <option value="credit">Credit</option>
            </select>

            <input
              placeholder="Account Number"
              value={form.masked_account}
              onChange={(e) =>
                setForm({ ...form, masked_account: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Balance"
              value={form.balance}
              onChange={(e) =>
                setForm({ ...form, balance: e.target.value })
              }
            />

            <div className="primary-checkbox">
              <input
                type="checkbox"
                checked={form.is_primary}
                onChange={(e) =>
                  setForm({ ...form, is_primary: e.target.checked })
                }
              />
              <span>Primary Account</span>
            </div>

            <button className="primary-button" onClick={submit}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {showDelete && (
        <Modal title="Delete Account" onClose={() => setShowDelete(false)}>
          <div className="modal-body" style={{ textAlign: "center" }}>
            <p>Are you sure you want to delete this account?</p>

            <div className="confirm-actions">
              <button className="action-btn delete-btn" onClick={deleteAccount}>
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
