import React, { useState } from "react";
import "./Dashboard.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";

const ACCOUNT_TYPES = [
  "Savings",
  "Checking",
  "Credit Card",
  "Loan",
  "Investment",
];

const DEFAULT_FORM = {
  bankName: "",
  accountType: "Savings",
  maskedAccount: "",
  currency: "INR",
  balance: "",
};

const initialAccounts = [
  {
    id: 1,
    bankName: "FinBank",
    accountType: "Savings",
    maskedAccount: "**** 4521",
    currency: "INR",
    balance: 24530.75,
  },
  {
    id: 2,
    bankName: "FinBank",
    accountType: "Credit Card",
    maskedAccount: "**** 9932",
    currency: "INR",
    balance: -5300.0,
  },
];

function Dashboard({ navigate }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  const openAddModal = () => {
    setMode("add");
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    setMode("edit");
    setForm({
      bankName: account.bankName,
      accountType: account.accountType,
      maskedAccount: account.maskedAccount,
      currency: account.currency,
      balance: account.balance.toString(),
    });
    setEditingId(account.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.bankName.trim() || !form.maskedAccount.trim()) {
      alert("Please fill Bank Name and Account Number.");
      return;
    }

    const newAccount = {
      id: editingId ?? Date.now(),
      bankName: form.bankName.trim(),
      accountType: form.accountType,
      maskedAccount: form.maskedAccount.trim(),
      currency: form.currency.trim() || "INR",
      balance: Number(form.balance || 0),
    };

    if (mode === "add") {
      setAccounts((prev) => [...prev, newAccount]);
    } else {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === editingId ? newAccount : acc))
      );
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    if (editingId === id) closeModal();
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-gradient">
        <header className="dashboard-header">
          <div className="header-left">
            <img src={finBankLogo} alt="FinBank Logo" className="header-logo" />
            <div>
              <h1 className="header-title">FinBank Dashboard</h1>
              <p className="header-subtitle">
                Manage all your accounts in one place.
              </p>
            </div>
          </div>
          <div className="header-right">
            <button
              className="link-btn danger"
              onClick={() => navigate("login")}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Your Accounts</h2>
              <p className="card-subtitle">
                View and manage all your linked bank accounts.
              </p>
            </div>
            <button className="primary-btn" onClick={openAddModal}>
              + Add Account
            </button>
          </div>

          <div className="summary-row">
            <div className="summary-card">
              <p className="summary-label">Total Accounts</p>
              <p className="summary-value">{accounts.length}</p>
            </div>
            <div className="summary-card">
              <p className="summary-label">Total Balance</p>
              <p className="summary-value">
                {totalBalance < 0 ? "-" : ""}₹
                {Math.abs(totalBalance).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="empty-state">
              <h3>No accounts yet</h3>
              <p>Start by adding a bank account to see your balances here.</p>
              <button className="primary-btn" onClick={openAddModal}>
                Add your first account
              </button>
            </div>
          ) : (
            <div className="accounts-grid">
              {accounts.map((account) => (
                <div key={account.id} className="account-card">
                  <div className="account-row">
                    <div>
                      <p className="account-bank">{account.bankName}</p>
                      <p className="account-type">{account.accountType}</p>
                    </div>
                    <span className="account-currency">
                      {account.currency}
                    </span>
                  </div>

                  <p className="account-number">{account.maskedAccount}</p>

                  <p
                    className={
                      account.balance >= 0
                        ? "account-balance positive"
                        : "account-balance negative"
                    }
                  >
                    {account.balance < 0 ? "-" : ""}₹
                    {Math.abs(account.balance).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                  <div className="account-actions">
                    <button
                      className="link-btn"
                      onClick={() => openEditModal(account)}
                    >
                      Edit
                    </button>
                    <span className="dot-separator">•</span>
                    <button
                      className="link-btn danger"
                      onClick={() => handleDelete(account.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-circle">
              <span className="modal-icon-building" />
            </div>
            <h3 className="modal-title">
              {mode === "add" ? "Add Account" : "Edit Account"}
            </h3>
            <p className="modal-subtitle">
              {mode === "add"
                ? "Link a new bank account to your FinBank dashboard."
                : "Update details for your bank account."}
            </p>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="Enter bank name"
                  value={form.bankName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select
                  name="accountType"
                  value={form.accountType}
                  onChange={handleChange}
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Masked Account Number</label>
                <input
                  type="text"
                  name="maskedAccount"
                  placeholder="e.g. **** 4521"
                  value={form.maskedAccount}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    name="currency"
                    placeholder="INR"
                    value={form.currency}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Current Balance</label>
                  <input
                    type="number"
                    name="balance"
                    placeholder="0.00"
                    step="0.01"
                    value={form.balance}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {mode === "add" ? "Save Account" : "Update Account"}
                </button>
              </div>

              {mode === "edit" && (
                <button
                  type="button"
                  className="link-btn danger small-delete"
                  onClick={() => handleDelete(editingId)}
                >
                  Delete this account
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
