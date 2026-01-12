import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    biller_name: "",
    amount_due: "",
    due_date: "",
  });

  /* ================= LOAD BILLS ================= */
  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("get", "/bills/");
      setBills(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
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

  const markAsPaid = async (bill) => {
    try {
      await apiFetch("put", `/bills/${bill.id}`, {
        ...bill,
        status: "paid",
      });

      setBills((prev) =>
        prev.map((b) =>
          b.id === bill.id ? { ...b, status: "paid" } : b
        )
      );

      toast.success(`"${bill.biller_name}" marked as paid`);
    } catch {
      toast.error("Failed to mark bill as paid");
    }
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

  const showPaid =
    activeFilter === "all" || activeFilter === "paid";

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
        <button className="action-btn" onClick={openCreate}>
          ➕ Add Bill
        </button>
      </div>

      {/* ===== MONTH SUMMARY ===== */}
      <div className="summary-card">
        💰 ₹ {monthlyPaidTotal} paid this month
      </div>

      {/* ===== ANALYTICS ===== */}

      

      <div className="analytics-grid">
        <div className="stat-card" onClick={() => setActiveFilter("all")}>
          Total Bills: {bills.length}
        </div>

        <div
          className="stat-card green"
          onClick={() => setActiveFilter("paid")}
        >
          Paid: {paidBills.length}
        </div>

        <div
          className="stat-card yellow"
          onClick={() => setActiveFilter("unpaid")}
        >
          Unpaid: {unpaidBills.length}
        </div>

        <div
          className="stat-card red"
          onClick={() => setActiveFilter("overdue")}
        >
          Overdue: {overdueBills.length}
        </div>
      </div>

      {/* ===== UNPAID BILLS ===== */}
      {showUnpaid && (
        <div className="cards-grid">
          {unpaidBills
            .filter((b) =>
              activeFilter === "overdue"
                ? getBillStatus(b) === "overdue"
                : true
            )
            .map((b) => {
              const status = getBillStatus(b);

              return (
                <div key={b.id} className="glass-card">
                  <h3>{b.biller_name}</h3>
                  <p>₹ {b.amount_due}</p>
                  <p>
                    Due: {new Date(b.due_date).toLocaleDateString()}
                  </p>

                  <div className="card-actions">
                    <span className={`bill-pill ${status}`}>
                      {status === "overdue"
                        ? "Overdue"
                        : status === "today"
                        ? "Due Today"
                        : "Upcoming"}
                    </span>

                    <button
                      className="action-btn pay-btn"
                      onClick={() => markAsPaid(b)}
                    >
                      Mark as Paid
                    </button>

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

      {/* ===== PAID BILLS ===== */}
      {showPaid && paidBills.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: "40px" }}>
            Paid Bills
          </h2>

          <div className="cards-grid">
            {paidBills.map((b) => (
              <div key={b.id} className="glass-card paid-card">
                <h3>{b.biller_name}</h3>
                <p>₹ {b.amount_due}</p>
                <span className="bill-pill paid">✓ Paid</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== MODAL ===== */}
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
