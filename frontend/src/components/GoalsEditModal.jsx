import React, { useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";

export default function GoalsEditModal({ isOpen, onClose, goalData, goalLabel, onSave }) {
    const [value, setValue] = useState(goalData);
    const [saving, setSaving] = useState(false);

    const isPercentage = goalLabel === "Savings Rate Goal" || goalLabel === "Bills Payment Target";

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(value);
            setValue(goalData);
            onClose();
        } catch (err) {
            console.error("Error saving goal:", err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="goals-edit-modal">
                <h2>Edit {goalLabel}</h2>
                <p className="modal-description">
                    {isPercentage
                        ? "Enter a percentage target (0-100%)"
                        : "Enter your spending limit in rupees"}
                </p>

                <div className="modal-input-group">
                    <div className="input-wrapper">
                        {!isPercentage && <span className="input-prefix">₹</span>}
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                            min="0"
                            max={isPercentage ? "100" : undefined}
                            step={isPercentage ? "0.1" : "1000"}
                            className="modal-input"
                            placeholder={isPercentage ? "e.g., 25" : "e.g., 100000"}
                        />
                        {isPercentage && <span className="input-suffix">%</span>}
                    </div>
                </div>

                <div className="modal-preview">
                    <span className="preview-label">Current Value:</span>
                    <span className="preview-value">
                        {isPercentage ? `${value.toFixed(1)}%` : `₹${value.toLocaleString()}`}
                    </span>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Goal"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
