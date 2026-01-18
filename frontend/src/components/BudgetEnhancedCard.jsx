import React, { useState } from 'react';
import './BudgetEnhancedCard.css';

const BudgetEnhancedCard = ({
    budget,
    onEdit,
    onDelete,
    onToggleRollover,
    onViewTransactions,
    onViewHistory
}) => {
    const [showMenu, setShowMenu] = useState(false);

    // Calculate metrics
    const spent = budget.spent_amount || 0;
    const limit = budget.limit_amount || 1;
    const remaining = limit - spent;
    const percentUsed = (spent / limit) * 100;

    // Status color logic
    const getStatusColor = () => {
        if (percentUsed < 60) return 'green';
        if (percentUsed < 90) return 'yellow';
        if (percentUsed < 100) return 'orange';
        return 'red';
    };

    const getStatusLabel = () => {
        if (percentUsed < 60) return 'Good';
        if (percentUsed < 90) return 'Caution';
        if (percentUsed < 100) return 'Warning';
        return 'Over Budget';
    };

    const statusColor = getStatusColor();
    const statusLabel = getStatusLabel();

    return (
        <div className={`budget-enhanced-card status-${statusColor}`}>
            {/* Header */}
            <div className="card-header">
                <div className="card-title-section">
                    <h3 className="card-title">{budget.category}</h3>
                    {budget.is_spending_frozen && (
                        <span className="freeze-badge" title="Spending Frozen">🔒</span>
                    )}
                    {budget.rollover_enabled && (
                        <span className="rollover-badge" title="Rollover Enabled">↻</span>
                    )}
                </div>

                <div className="card-menu">
                    <button
                        className="menu-button"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        ⋮
                    </button>
                    {showMenu && (
                        <div className="dropdown-menu">
                            <button onClick={() => { onEdit(budget); setShowMenu(false); }}>
                                ✎ Edit
                            </button>
                            <button onClick={() => { onViewTransactions(budget.category); setShowMenu(false); }}>
                                📋 Transactions
                            </button>
                            {onViewHistory && (
                                <button onClick={() => { onViewHistory(budget.category); setShowMenu(false); }}>
                                    📊 History
                                </button>
                            )}
                            <button
                                className="delete-btn"
                                onClick={() => { onDelete(budget.id); setShowMenu(false); }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Indicator */}
            <div className={`status-indicator status-${statusColor}`}>
                <span className="status-label">{statusLabel}</span>
                <span className="status-percent">{Math.round(percentUsed)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar-background">
                    <div
                        className={`progress-bar progress-${statusColor}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                </div>
            </div>

            {/* Amounts */}
            <div className="amounts-section">
                <div className="amount-item">
                    <span className="amount-label">Limit</span>
                    <span className="amount-value">₹{limit.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                    <span className="amount-label">Spent</span>
                    <span className="amount-value spent">₹{spent.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                    <span className="amount-label">Remaining</span>
                    <span className={`amount-value remaining ${remaining < 0 ? 'negative' : ''}`}>
                        ₹{remaining.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Over Budget Alert */}
            {percentUsed > 100 && (
                <div className="over-budget-alert">
                    ⚠️ You've exceeded your budget by ₹{Math.abs(remaining).toFixed(2)}
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                {budget.rollover_enabled !== undefined && (
                    <button
                        className={`action-button rollover-toggle ${budget.rollover_enabled ? 'active' : ''}`}
                        onClick={() => onToggleRollover(budget.id)}
                        title={budget.rollover_enabled ? 'Disable rollover' : 'Enable rollover'}
                    >
                        ↻ Rollover: {budget.rollover_enabled ? 'ON' : 'OFF'}
                    </button>
                )}
                <button
                    className="action-button transactions-button"
                    onClick={() => onViewTransactions(budget.category)}
                    title="View transactions"
                >
                    📋 Transactions
                </button>
            </div>

            {/* Color Indicator */}
            {budget.color_code && (
                <div className="color-indicator">
                    <div
                        className="color-swatch"
                        style={{ backgroundColor: budget.color_code }}
                        title={`Category color: ${budget.color_code}`}
                    />
                </div>
            )}
        </div>
    );
};

export default BudgetEnhancedCard;
