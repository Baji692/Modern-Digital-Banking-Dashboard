import React, { useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";

export default function AddCustomGoalModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        goal_type: "amount",
        target_value: "",
        current_value: "0",
        category: "savings",
        target_date: "",
        priority: "medium",
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.name.trim()) {
            toast.error("Goal name is required");
            return;
        }

        if (!formData.target_value || parseFloat(formData.target_value) <= 0) {
            toast.error("Target value must be greater than 0");
            return;
        }

        if (formData.goal_type === "percentage") {
            const val = parseFloat(formData.target_value);
            if (val > 100) {
                toast.error("Percentage cannot exceed 100%");
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                goal_type: formData.goal_type,
                target_value: parseFloat(formData.target_value),
                current_value: parseFloat(formData.current_value) || 0,
                category: formData.category,
                target_date: formData.target_date || null,
                priority: formData.priority,
            };

            await onSave(payload);

            // Reset form
            setFormData({
                name: "",
                description: "",
                goal_type: "amount",
                target_value: "",
                current_value: "0",
                category: "savings",
                target_date: "",
                priority: "medium",
            });

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
            <div className="add-custom-goal-modal">
                <h2>Create New Financial Goal</h2>
                <p className="modal-description">
                    Set up a custom goal to track your financial progress
                </p>

                <div className="form-section">
                    {/* Goal Name */}
                    <div className="form-group">
                        <label className="form-label">Goal Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="form-input"
                            placeholder="e.g., Vacation Fund, Emergency Fund"
                            maxLength="100"
                        />
                        <span className="char-count">{formData.name.length}/100</span>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="form-input form-textarea"
                            placeholder="Add details about this goal..."
                            maxLength="500"
                            rows="3"
                        />
                        <span className="char-count">{formData.description.length}/500</span>
                    </div>

                    {/* Goal Type and Category Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Goal Type *</label>
                            <select
                                value={formData.goal_type}
                                onChange={(e) => handleChange("goal_type", e.target.value)}
                                className="form-input"
                            >
                                <option value="amount">Amount (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="form-input"
                            >
                                <option value="savings">Savings</option>
                                <option value="spending">Spending Limit</option>
                                <option value="investment">Investment</option>
                                <option value="debt">Debt Repayment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Target and Current Values Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Target Value *</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    value={formData.target_value}
                                    onChange={(e) => handleChange("target_value", e.target.value)}
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                    step={formData.goal_type === "percentage" ? "0.1" : "100"}
                                />
                                <span className="unit">
                                    {formData.goal_type === "percentage" ? "%" : "₹"}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Current Value (Optional)</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    value={formData.current_value}
                                    onChange={(e) => handleChange("current_value", e.target.value)}
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                    step={formData.goal_type === "percentage" ? "0.1" : "100"}
                                />
                                <span className="unit">
                                    {formData.goal_type === "percentage" ? "%" : "₹"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Target Date and Priority Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Target Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.target_date}
                                onChange={(e) => handleChange("target_date", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleChange("priority", e.target.value)}
                                className="form-input"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Progress Preview */}
                    {formData.target_value && (
                        <div className="progress-preview">
                            <span className="preview-label">Progress Preview:</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(
                                            (parseFloat(formData.current_value || 0) /
                                                parseFloat(formData.target_value)) *
                                            100,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <span className="progress-text">
                                {(
                                    (parseFloat(formData.current_value || 0) /
                                        parseFloat(formData.target_value)) *
                                    100
                                ).toFixed(1)}
                                %
                            </span>
                        </div>
                    )}
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
                        {saving ? "Creating..." : "Create Goal"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
