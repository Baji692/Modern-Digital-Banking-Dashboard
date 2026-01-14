import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  /* ===== PAY BILL ===== */
  const [showPay, setShowPay] = useState(false);
  const [payingBill, setPayingBill] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [form, setForm] = useState({
    biller_name: "",
    amount_due: "",
    due_date: "",
  });

  /* Global auto-reminder setting (stored in localStorage) */
  const [globalAutoReminder, setGlobalAutoReminder] = useState(false);

  /* Reminder schedule preferences per bill (stored in localStorage) */
  const [reminderSchedules, setReminderSchedules] = useState({});

  /* ================= LOAD DATA ================= */
  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("get", "/bills/");
      setBills(data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await apiFetch("get", "/accounts/");
      setAccounts(data || []);
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => {
    loadBills();
    loadAccounts();

    // Load global auto-reminder setting from localStorage
    const savedAutoReminder = localStorage.getItem("bill_global_auto_reminder");
    setGlobalAutoReminder(savedAutoReminder === "true");

    // Load reminder schedules from localStorage
    const savedSchedules = localStorage.getItem("bill_reminder_schedules");
    if (savedSchedules) {
      setReminderSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  /* ================= CREATE / EDIT ================= */
  const openCreate = () => {
    setEditing(null);
    setForm({ biller_name: "", amount_due: "", due_date: "" });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      biller_name: b.biller_name,
      amount_due: b.amount_due,
      due_date: b.due_date.slice(0, 10),
    });
    setShowModal(true);
  };

  const submit = async () => {
    const payload = editing
      ? {
        biller_name: form.biller_name,
        amount_due: Number(form.amount_due),
        due_date: form.due_date,
        status: editing.status,
        auto_pay: editing.auto_pay,
      }
      : {
        biller_name: form.biller_name,
        amount_due: Number(form.amount_due),
        due_date: form.due_date,
      };

    try {
      if (editing) {
        await apiFetch("put", `/bills/${editing.id}`, payload);
        toast.success("Bill updated successfully");
      } else {
        await apiFetch("post", "/bills/", payload);
        toast.success("Bill created successfully");
      }

      setShowModal(false);
      loadBills();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = (bill) => {
    setDeleting(bill);
    setShowDelete(true);
  };

  const deleteBill = async () => {
    try {
      await apiFetch("delete", `/bills/${deleting.id}`);
      toast.success("Bill deleted successfully");
      setShowDelete(false);
      loadBills();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= REMIND ME ================= */
  const sendReminder = async (bill) => {
    try {
      const res = await apiFetch(
        "post",
        `/bills/${bill.id}/remind`
      );
      toast.success(res.message || "Reminder scheduled successfully!");
    } catch (err) {
      console.error("Reminder error details:", err);
      let errorMsg = "Failed to set reminder";
      if (err.message) {
        errorMsg = err.message;
      } else if (err.detail) {
        errorMsg = err.detail;
      } else if (typeof err === "string") {
        errorMsg = err;
      }
      toast.error(errorMsg);
    }
  };

  /* ================= REMINDER SCHEDULE ================= */
  const setReminderSchedule = (billId, schedule) => {
    const updated = { ...reminderSchedules };
    if (schedule === "no_reminder") {
      delete updated[billId];
    } else {
      updated[billId] = schedule;
    }
    setReminderSchedules(updated);
    localStorage.setItem("bill_reminder_schedules", JSON.stringify(updated));

    if (schedule === "no_reminder") {
      toast.info("Reminder cancelled");
    } else {
      // Convert schedule value to readable format
      const scheduleLabels = {
        "send_now": "Send Now",
        "1440": "24 hours before",
        "720": "12 hours before",
        "60": "1 hour before",
        "30": "30 minutes before"
      };
      const readableSchedule = scheduleLabels[schedule] || schedule;
      toast.info(`Reminder set to: ${readableSchedule}`);

      // If user selected Send Now, trigger the reminder API immediately
      if (schedule === "send_now") {
        const bill = bills.find((b) => b.id === billId);
        if (bill) {
          sendReminder(bill);
          // Clear the saved schedule to avoid repeated sends
          const after = { ...updated };
          delete after[billId];
          setReminderSchedules(after);
          localStorage.setItem("bill_reminder_schedules", JSON.stringify(after));
        }
      }
    }
  };


  /* ================= GLOBAL AUTO REMINDER ================= */
  const toggleGlobalAutoReminder = () => {
    const newValue = !globalAutoReminder;
    setGlobalAutoReminder(newValue);
    localStorage.setItem("bill_global_auto_reminder", newValue.toString());

    if (newValue) {
      toast.success("Auto-reminders enabled for all active bills");
    } else {
      toast.info("Auto-reminders disabled");
    }
  };

  // Check auto-reminders every minute (applies to all bills if global is enabled)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (globalAutoReminder) {
        bills.forEach((bill) => {
          const schedule = reminderSchedules[bill.id];
          if (bill.status !== "paid" && schedule && schedule !== "no_reminder") {
            // Handle "send_now" option
            if (schedule === "send_now") {
              sendReminder(bill);
              // Remove after sending to avoid repeated sends
              setReminderSchedule(bill.id, "no_reminder");
              return;
            }

            const now = new Date();
            const dueDate = new Date(bill.due_date);
            const minutesUntilDue = (dueDate - now) / (1000 * 60);

            // Convert schedule minutes to compare with minutesUntilDue
            const reminderMinutes = parseInt(schedule);
            // Send reminder when within 1 minute window of scheduled time
            if (minutesUntilDue <= reminderMinutes && minutesUntilDue > reminderMinutes - 1) {
              sendReminder(bill);
            }
          }
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [bills, globalAutoReminder, reminderSchedules, setReminderSchedule]);

  /* ================= PAY BILL ================= */
  const openPay = (bill) => {
    setPayingBill(bill);

    if (accounts.length === 1) {
      setSelectedAccountId(accounts[0].id);
    } else {
      setSelectedAccountId("");
    }

    setShowPay(true);
  };

  const confirmPay = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }

    try {
      const res = await apiFetch(
        "post",
        `/bills/${payingBill.id}/pay?account_id=${selectedAccountId}`
      );

      toast.success(res.message);

      setShowPay(false);
      setPayingBill(null);
      setSelectedAccountId("");

      loadBills();
    } catch (err) {
      console.error("Pay bill error:", err);
      toast.error(err.message || "Payment failed");
    }
  };

  /* ================= STATUS ================= */
  const getBillStatus = (bill) => {
    if (bill.status === "paid") return "paid";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(bill.due_date);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "overdue";
    if (due.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  if (loading) return <p>Loading bills...</p>;

  /* ================= SPLITS ================= */
  const paidBills = bills.filter((b) => b.status === "paid");
  const unpaidBills = bills.filter((b) => b.status !== "paid");
  const overdueBills = unpaidBills.filter(
    (b) => getBillStatus(b) === "overdue"
  );

  /* ================= FILTER VISIBILITY ================= */
  const showUnpaid =
    activeFilter === "all" ||
    activeFilter === "unpaid" ||
    activeFilter === "overdue";

  const showPaid = activeFilter === "all" || activeFilter === "paid";

  /* ================= SUMMARY ================= */
  const monthlyPaidTotal = paidBills.reduce(
    (sum, b) => sum + Number(b.amount_due),
    0
  );

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Bills</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className={`action-btn ${globalAutoReminder ? "auto-active" : ""}`}
            onClick={toggleGlobalAutoReminder}
            title="Enable/disable automatic reminders for all bills"
            style={{
              background: globalAutoReminder
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #64748b, #475569)",
              padding: "10px 16px",
            }}
          >
            {globalAutoReminder ? "⏰ Auto On" : "⏰ Auto Off"}
          </button>
          <button className="action-btn" onClick={openCreate}>
            Add Bill
          </button>
        </div>
      </div>

      {/* ===== MONTH SUMMARY ===== */}
      <div className="summary-card">
        💰 ₹ {monthlyPaidTotal} paid this month
      </div>

      {/* ===== ANALYTICS ===== */}
      <div className="analytics-grid">
        <div
          className={`stat-card ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Total Bills: {bills.length}
        </div>

        <div
          className={`stat-card green ${activeFilter === "paid" ? "active" : ""}`}
          onClick={() => setActiveFilter("paid")}
        >
          Paid: {paidBills.length}
        </div>

        <div
          className={`stat-card yellow ${activeFilter === "unpaid" ? "active" : ""}`}
          onClick={() => setActiveFilter("unpaid")}
        >
          Unpaid: {unpaidBills.length}
        </div>

        <div
          className={`stat-card red ${activeFilter === "overdue" ? "active" : ""}`}
          onClick={() => setActiveFilter("overdue")}
        >
          Overdue: {overdueBills.length}
        </div>
      </div>

      {/* ===== UNPAID BILLS ===== */}
      {showUnpaid && (
        <div className="cards-grid unpaid-grid">
          {unpaidBills
            .filter((b) =>
              activeFilter === "overdue"
                ? getBillStatus(b) === "overdue"
                : activeFilter === "unpaid"
                  ? true
                  : true
            )
            .map((b) => {
              const status = getBillStatus(b);

              return (
                <div key={b.id} className="glass-card">
                  <div className="bill-header">
                    <h3>{b.biller_name}</h3>
                    <span className={`bill-pill ${status}`}>
                      {status === "overdue"
                        ? "Overdue"
                        : status === "today"
                          ? "Due Today"
                          : "Upcoming"}
                    </span>
                  </div>
                  <p>₹ {b.amount_due}</p>
                  <p>
                    Due: {new Date(b.due_date).toLocaleDateString()}
                  </p>

                  <div className="card-actions">
                    <button
                      className="action-btn pay-btn"
                      onClick={() => openPay(b)}
                    >
                      Pay Bill
                    </button>

                    <select
                      className="action-select reminder-select"
                      value={reminderSchedules[b.id] || "no_reminder"}
                      onChange={(e) => setReminderSchedule(b.id, e.target.value)}
                      title="Set reminder schedule"
                    >
                      <option value="no_reminder">No Reminder</option>
                      <option value="send_now">Send Now</option>
                      <option value="1440">24 hours before</option>
                      <option value="720">12 hours before</option>
                      <option value="60">1 hour before</option>
                      <option value="30">30 minutes before</option>
                    </select>

                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </button>

                    <button
                      className="action-btn delete-btn"
                      onClick={() => confirmDelete(b)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ===== EMPTY STATE FOR FILTERED UNPAID ===== */}
      {showUnpaid &&
        unpaidBills.filter((b) =>
          activeFilter === "overdue" ? getBillStatus(b) === "overdue" : true
        ).length === 0 && (
          <div className="empty-state">
            <p>
              {activeFilter === "overdue"
                ? "No overdue bills"
                : activeFilter === "unpaid"
                  ? "No unpaid bills"
                  : "No bills found"}
            </p>
          </div>
        )}

      {/* ===== PAID BILLS ===== */}
      {showPaid && paidBills.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: "40px" }}>
            Paid Bills
          </h2>

          <div className="cards-grid">
            {paidBills.map((b) => (
              <div key={b.id} className="glass-card paid-card">
                <div className="paid-card-header">
                  <h3>{b.biller_name}</h3>
                </div>
                <div className="paid-card-amount">
                  ₹ {b.amount_due}
                </div>
                <div className="paid-card-footer">
                  <span className="bill-pill paid">✓ Paid</span>
                  {b.paid_date && (
                    <span className="paid-date-badge">
                      {new Date(b.paid_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== PAY MODAL ===== */}
      {showPay && (
        <Modal
          title={`Pay ${payingBill.biller_name}`}
          onClose={() => setShowPay(false)}
        >
          <div className="modal-body">
            <p>
              Amount: <strong>₹ {payingBill.amount_due}</strong>
            </p>

            {accounts.length > 1 && (
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">Select Account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bank_name} ({a.masked_account}) — ₹{a.balance}
                  </option>
                ))}
              </select>
            )}

            {accounts.length === 1 && (
              <p>
                Paying from <strong>{accounts[0].bank_name}</strong>
              </p>
            )}

            <button className="primary-button" onClick={confirmPay}>
              Confirm Payment
            </button>
          </div>
        </Modal>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      {showModal && (
        <Modal
          title={editing ? "Edit Bill" : "Create Bill"}
          onClose={() => setShowModal(false)}
        >
          <div className="modal-body">
            <input
              placeholder="Biller Name"
              value={form.biller_name}
              onChange={(e) =>
                setForm({ ...form, biller_name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              value={form.amount_due}
              onChange={(e) =>
                setForm({ ...form, amount_due: e.target.value })
              }
            />

            <input
              type="date"
              value={form.due_date}
              onChange={(e) =>
                setForm({ ...form, due_date: e.target.value })
              }
            />

            <button className="primary-button" onClick={submit}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ===== DELETE CONFIRM ===== */}
      {showDelete && (
        <Modal title="Delete Bill" onClose={() => setShowDelete(false)}>
          <div className="modal-body" style={{ textAlign: "center" }}>
            <p>Are you sure you want to delete this bill?</p>

            <div className="confirm-actions">
              <button className="action-btn delete-btn" onClick={deleteBill}>
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
