import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";
import AddCustomGoalModal from "../components/AddCustomGoalModal";
import "./Pages.css";

export default function GoalsSettings() {
    const [userId, setUserId] = useState(null);
    const [goals, setGoals] = useState({
        savings_goal: 20,
        spending_goal: 100000,
        bills_goal: 100,
    });
    const [customGoals, setCustomGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);

    // Get user ID from localStorage
    useEffect(() => {
        const userData = localStorage.getItem("finbank_user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserId(user.id);
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);

    // Fetch user goals and custom goals
    useEffect(() => {
        if (!userId) return;

        const fetchGoals = async () => {
            try {
                const [goalData, customGoalsData] = await Promise.all([
                    apiFetch("get", `/goals/summary/${userId}`),
                    apiFetch("get", `/goals/custom/${userId}`),
                ]);

                if (goalData) {
                    setGoals({
                        savings_goal: goalData.savings_goal,
                        spending_goal: goalData.spending_goal,
                        bills_goal: goalData.bills_goal,
                    });
                }

                if (customGoalsData) {
                    setCustomGoals(customGoalsData);
                }
            } catch (err) {
                console.error("Error fetching goals:", err);
                toast.error("Failed to load goals");
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [userId]);

    const handleChange = (field, value) => {
        setGoals((prev) => ({
            ...prev,
            [field]: parseFloat(value) || 0,
        }));
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            const response = await apiFetch("put", `/goals/update/${userId}`, goals);
            if (response) {
                setGoals({
                    savings_goal: response.savings_goal,
                    spending_goal: response.spending_goal,
                    bills_goal: response.bills_goal,
                });
                toast.success("Goals updated successfully!");
            }
        } catch (err) {
            console.error("Error saving goals:", err);
            toast.error("Failed to save goals");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingOverlay text="Loading your goals..." />;

    return (
        <div className="goals-settings-container">
            <div className="settings-header">
                <h1 className="dash-title">Financial Goals</h1>
                <p className="settings-subtitle">Set your financial targets to track and improve</p>
            </div>

            <div className="goals-form">
                {/* Savings Goal */}
                <div className="goal-card">
                    <div className="goal-info">
                        <h3>Savings Rate Goal</h3>
                        <p className="goal-description">Target percentage of income to save</p>
                    </div>
                    <div className="goal-input-group">
                        <input
                            type="number"
                            value={goals.savings_goal}
                            onChange={(e) => handleChange("savings_goal", e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            className="goal-input"
                            placeholder="Enter percentage"
                        />
                        <span className="goal-unit">%</span>
                    </div>
                    <div className="goal-hint">
                        <span className="hint-label">Current Target:</span>
                        <span className="hint-value">{goals.savings_goal.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Spending Goal */}
                <div className="goal-card">
                    <div className="goal-info">
                        <h3>Monthly Spending Limit</h3>
                        <p className="goal-description">Maximum you want to spend per month</p>
                    </div>
                    <div className="goal-input-group">
                        <span className="goal-currency">₹</span>
                        <input
                            type="number"
                            value={goals.spending_goal}
                            onChange={(e) => handleChange("spending_goal", e.target.value)}
                            min="0"
                            step="1000"
                            className="goal-input"
                            placeholder="Enter amount"
                        />
                    </div>
                    <div className="goal-hint">
                        <span className="hint-label">Current Target:</span>
                        <span className="hint-value">₹{goals.spending_goal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Bills Goal */}
                <div className="goal-card">
                    <div className="goal-info">
                        <h3>Bills Payment Target</h3>
                        <p className="goal-description">Target percentage of bills to pay on time</p>
                    </div>
                    <div className="goal-input-group">
                        <input
                            type="number"
                            value={goals.bills_goal}
                            onChange={(e) => handleChange("bills_goal", e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            className="goal-input"
                            placeholder="Enter percentage"
                        />
                        <span className="goal-unit">%</span>
                    </div>
                    <div className="goal-hint">
                        <span className="hint-label">Current Target:</span>
                        <span className="hint-value">{goals.bills_goal.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div className="settings-actions">
                <button
                    className="btn-primary btn-lg"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Goals"}
                </button>
                <p className="settings-info">
                    💡 Tip: Update your goals regularly based on your financial situation.
                </p>
            </div>

            {/* Custom Goals Section */}
            <div className="custom-goals-section">
                <div className="section-header-custom">
                    <h2>Custom Financial Goals</h2>
                    <button
                        className="btn-add-goal"
                        onClick={() => setShowAddGoalModal(true)}
                    >
                        + Add New Goal
                    </button>
                </div>

                {customGoals.length > 0 ? (
                    <div className="custom-goals-grid">
                        {customGoals.map((goal) => (
                            <CustomGoalCard
                                key={goal.id}
                                goal={goal}
                                onUpdate={() => {
                                    // Refresh custom goals
                                    if (userId) {
                                        apiFetch("get", `/goals/custom/${userId}`)
                                            .then(setCustomGoals)
                                            .catch(err => console.error("Error refreshing goals:", err));
                                    }
                                }}
                                onDelete={() => {
                                    // Refresh custom goals after deletion
                                    if (userId) {
                                        apiFetch("get", `/goals/custom/${userId}`)
                                            .then(setCustomGoals)
                                            .catch(err => console.error("Error refreshing goals:", err));
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-custom-goals">
                        <p>No custom goals yet</p>
                        <p className="no-goals-hint">Create your first goal to get started!</p>
                    </div>
                )}
            </div>

            {/* Add Goal Modal */}
            <AddCustomGoalModal
                isOpen={showAddGoalModal}
                onClose={() => setShowAddGoalModal(false)}
                onSave={async (goalData) => {
                    try {
                        await apiFetch("post", `/goals/custom/${userId}`, goalData);
                        toast.success("Goal created successfully!");

                        // Refresh custom goals list
                        const updated = await apiFetch("get", `/goals/custom/${userId}`);
                        setCustomGoals(updated);
                    } catch (err) {
                        console.error("Error creating goal:", err);
                        toast.error("Failed to create goal");
                        throw err;
                    }
                }}
            />
        </div>
    );
}

// Custom Goal Card Component
function CustomGoalCard({ goal, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        current_value: goal.current_value,
    });

    const percentage = (goal.current_value / goal.target_value) * 100;
    const unit = goal.goal_type === "percentage" ? "%" : "₹";

    const handleUpdateProgress = async () => {
        try {
            await apiFetch("put", `/goals/custom/${goal.id}`, editData);
            toast.success("Goal updated!");
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            console.error("Error updating goal:", err);
            toast.error("Failed to update goal");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            try {
                await apiFetch("delete", `/goals/custom/${goal.id}`);
                toast.success("Goal deleted!");
                onDelete();
            } catch (err) {
                console.error("Error deleting goal:", err);
                toast.error("Failed to delete goal");
            }
        }
    };

    return (
        <div className="custom-goal-card">
            <div className="goal-card-header">
                <h3>{goal.name}</h3>
                <div className="goal-card-actions">
                    <button
                        className="goal-action-btn edit"
                        onClick={() => setIsEditing(!isEditing)}
                        title="Edit progress"
                    >
                        ✏️
                    </button>
                    <button
                        className="goal-action-btn delete"
                        onClick={handleDelete}
                        title="Delete goal"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {goal.description && (
                <p className="goal-card-description">{goal.description}</p>
            )}

            <div className="goal-card-info">
                <span className="info-badge" style={{
                    backgroundColor: getCategoryColor(goal.category)
                }}>
                    {goal.category}
                </span>
                <span className="info-badge priority" style={{
                    backgroundColor: getPriorityColor(goal.priority)
                }}>
                    {goal.priority}
                </span>
            </div>

            <div className="goal-progress">
                <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    {isEditing ? (
                        <div className="progress-edit">
                            <input
                                type="number"
                                value={editData.current_value}
                                onChange={(e) => setEditData({
                                    current_value: parseFloat(e.target.value) || 0
                                })}
                                min="0"
                                step={goal.goal_type === "percentage" ? "0.1" : "100"}
                                className="progress-input"
                            />
                            <span className="unit">{unit}</span>
                        </div>
                    ) : (
                        <span className="progress-value">
                            {goal.current_value.toFixed(goal.goal_type === "percentage" ? 1 : 0)}{unit}
                        </span>
                    )}
                </div>
                <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: getProgressColor(percentage),
                            }}
                        />
                    </div>
                </div>
                <div className="progress-footer">
                    <span className="progress-text">{percentage.toFixed(0)}%</span>
                    <span className="target-text">
                        Goal: {goal.target_value.toFixed(goal.goal_type === "percentage" ? 1 : 0)}{unit}
                    </span>
                </div>
            </div>

            {goal.target_date && (
                <div className="goal-target-date">
                    <span className="date-label">Target Date:</span>
                    <span className="date-value">
                        {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                </div>
            )}

            {isEditing && (
                <div className="goal-edit-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleUpdateProgress}
                    >
                        Update
                    </button>
                </div>
            )}
        </div>
    );
}

// Helper functions for colors
function getCategoryColor(category) {
    const colors = {
        savings: "#10b981",
        spending: "#3b82f6",
        investment: "#f59e0b",
        debt: "#ef4444",
        other: "#8b5cf6",
    };
    return colors[category] || "#6b7280";
}

function getPriorityColor(priority) {
    const colors = {
        low: "#6b7280",
        medium: "#f59e0b",
        high: "#ef4444",
    };
    return colors[priority] || "#6b7280";
}

function getProgressColor(percentage) {
    if (percentage >= 100) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    if (percentage >= 50) return "#3b82f6";
    return "#6b7280";
}
