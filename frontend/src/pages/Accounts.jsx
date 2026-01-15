import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import LoadingOverlay from "../components/LoadingOverlay";
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
    } catch (err) {
      console.error("Error loading accounts:", err);
      toast.error("Failed to load accounts: " + err.message);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const data = await apiFetch("get", "/transactions/recent");
      setRecentTransactions(data || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
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
      (t) => t.account_id === selectedAccount.id
    )
    : recentTransactions;

  if (loading) return <LoadingOverlay text="Loading accounts..." />;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Accounts</h1>
        <button className="action-btn" onClick={openCreate}>
          Add Account
        </button>
      </div>

      {/* ===== ACCOUNT CARDS (3 PER ROW) ===== */}
      <div className="cards-grid three-col">
        {accounts.map((a) => (
          <div
            key={a.id}
            className={`glass-card account-card ${selectedAccount?.id === a.id ? "active-card" : ""}`}
            onClick={() =>
              setSelectedAccount(
                selectedAccount?.id === a.id ? null : a
              )
            }
          >
            <h3>{a.bank_name}</h3>
            {/* account type badge will be positioned top-right via CSS */}
            <div className="account-type-badge">{a.account_type}</div>

            <div className="account-number-row">
              <div className="account-number-text">
                {visibleAccountId === a.id
                  ? a.masked_account
                  : maskAccountNumber(a.masked_account)}
              </div>

              <button
                className="eye-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleAccountId(
                    visibleAccountId === a.id ? null : a.id
                  );
                }}
                aria-label={visibleAccountId === a.id ? "Hide account number" : "Show account number"}
              >
                {visibleAccountId === a.id ? (
                  /* eye-off / closed eye icon (outlined white) - Heroicons-style */
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke="#fff" fill="none">
                    <path d="M3.98 8.223A10.97 10.97 0 011.708 12C3.439 15.89 7.709 19 12 19c1.03 0 2.02-.135 2.94-.39" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M14.12 9.88A3 3 0 109.88 14.12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M1 1l22 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : (
                  /* eye / open eye icon (outlined white) - Heroicons-style */
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke="#fff" fill="none">
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </button>
            </div>

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
                  <td>
                    {(() => {
                      const desc = t.description || "";
                      const isBill = /bill payment/i.test(desc);
                      if (isBill) {
                        const merchantName = t.merchant || desc.replace(/bill payment\s*[–—-]?\s*/i, "");
                        return (
                          <>
                            {merchantName}
                            <span className="bill-badge">Bill</span>
                          </>
                        );
                      }
                      return desc;
                    })()}
                  </td>
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
