import React, { useEffect, useState } from "react";
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

const FilterIcon = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
    </svg>
);

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState("all");

    /* ===== CATEGORY FILTER ===== */
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);

    /* ===== CSV ===== */
    const [showUpload, setShowUpload] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState("");

    /* ================= LOAD DATA ================= */
    const loadTransactions = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("get", "/transactions/");
            setTransactions(data || []);
        } catch {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const loadAccounts = async () => {
        try {
            const data = await apiFetch("get", "/accounts/");
            setAccounts(data || []);
        } catch {
            toast.error("Failed to load accounts");
        }
    };

    useEffect(() => {
        loadTransactions();
        loadAccounts();
    }, []);

    /* ================= CSV UPLOAD ================= */
    const uploadCSV = async () => {
        if (!csvFile || !accountId) {
            toast.error("Select account and CSV file");
            return;
        }

        const formData = new FormData();
        formData.append("file", csvFile);

        try {
            await apiFetch(
                "post",
                `/transactions/import-csv?account_id=${accountId}`,
                formData,
                true
            );
            toast.success("Transactions imported successfully");
            setShowUpload(false);
            setCsvFile(null);
            setAccountId("");
            loadTransactions();
        } catch (err) {
            toast.error(err.message);
        }
    };

    /* ================= CATEGORY TOGGLE ================= */
    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const clearCategories = () => {
        setSelectedCategories([]);
    };

    /* ================= FILTER LOGIC ================= */
    const filteredTransactions = transactions.filter((t) => {
        if (filterType !== "all" && t.txn_type !== filterType) return false;

        if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(t.category || "Uncategorized")
        ) {
            return false;
        }

        return true;
    });

    if (loading) return <p>Loading transactions...</p>;

    return (
        <>
            {/* ===== HEADER ===== */}
            <div className="page-header">
                <h1>Transactions</h1>

                <div className="filter-group">
                    <button
                        className={filterType === "all" ? "filter-active" : ""}
                        onClick={() => setFilterType("all")}
                    >
                        All
                    </button>
                    <button
                        className={filterType === "debit" ? "filter-active" : ""}
                        onClick={() => setFilterType("debit")}
                    >
                        Debit
                    </button>
                    <button
                        className={filterType === "credit" ? "filter-active" : ""}
                        onClick={() => setFilterType("credit")}
                    >
                        Credit
                    </button>

                    <button
                        className="action-btn filter-btn"
                        onClick={() => setShowCategoryFilter((s) => !s)}
                    >
                        <FilterIcon />
                        <span>Filter</span>
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => setShowUpload(true)}
                    >
                        ⬆ Import CSV
                    </button>
                </div>
            </div>

            {/* ===== CATEGORY FILTER POPUP ===== */}
            {showCategoryFilter && (
                <div className="filter-popup glass-card">
                    <h4>Filter by Category</h4>

                    <div className="checkbox-list">
                        {CATEGORY_OPTIONS.map((c) => (
                            <label key={c} className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(c)}
                                    onChange={() => toggleCategory(c)}
                                />
                                <span>{c}</span>
                            </label>
                        ))}
                    </div>

                    <button className="link-button" onClick={clearCategories}>
                        Clear
                    </button>
                </div>
            )}

            {/* ===== TRANSACTIONS TABLE ===== */}
            <div className="glass-card">
                <table className="txn-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Merchant</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTransactions.map((t) => (
                            <tr key={t.id}>
                                <td>{new Date(t.txn_date).toLocaleDateString()}</td>
                                <td>{t.description}</td>
                                <td>{t.merchant || "-"}</td>
                                <td>
                                    <span className="category-pill">
                                        {t.category || "Uncategorized"}
                                    </span>
                                </td>
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
                    </tbody>
                </table>
            </div>

            {/* ===== CSV MODAL (WIDE) ===== */}
            {showUpload && (
                <Modal
                    title="Import Transactions (CSV)"
                    onClose={() => setShowUpload(false)}
                    className="csv-modal"
                >
                    <div className="modal-body">
                        <p style={{ fontWeight: 600, marginBottom: "6px" }}>
                            CSV Format Guidelines
                        </p>

                        <ul style={{ fontSize: "13px", opacity: 0.85 }}>
                            <li>
                                Required columns:{" "}
                                <b>description, amount, txn_type, txn_date</b>
                            </li>
                            <li>
                                Optional columns: <b>merchant, currency</b>
                            </li>
                            <li>
                                txn_type values: <b>debit</b> or <b>credit</b>
                            </li>
                            <li>
                                Date format: <b>YYYY-MM-DD</b>
                            </li>
                        </ul>

                        <div className="glass-card csv-preview-card">
                            <div className="csv-table-wrapper">
                                <table className="txn-table csv-preview-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Merchant</th>
                                            <th>Amount</th>
                                            <th>Currency</th>
                                            <th>Type</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Grocery Shopping</td>
                                            <td>Whole Foods</td>
                                            <td>125.50</td>
                                            <td>INR</td>
                                            <td>debit</td>
                                            <td>2025-12-26</td>
                                        </tr>
                                        <tr>
                                            <td>Salary Credit</td>
                                            <td>Company XYZ</td>
                                            <td>45000</td>
                                            <td>INR</td>
                                            <td>credit</td>
                                            <td>2025-12-25</td>
                                        </tr>
                                        <tr>
                                            <td>Electricity Bill</td>
                                            <td>Power Grid</td>
                                            <td>89.75</td>
                                            <td>INR</td>
                                            <td>debit</td>
                                            <td>2025-12-24</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr style={{ margin: "16px 0", opacity: 0.2 }} />

                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                        >
                            <option value="">Select Account</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.bank_name} ({a.masked_account})
                                </option>
                            ))}
                        </select>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                        />

                        <button className="primary-button" onClick={uploadCSV}>
                            Upload
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
