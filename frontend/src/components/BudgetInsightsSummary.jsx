import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "./BudgetInsights.css";

/**
 * BudgetInsightsSummary - Top panel showing:
 * - Total monthly budget
 * - Total spent
 * - Remaining amount  
 * - Overall % used
 * - Count of overspent categories
 * 
 * Displayed as an addon above the main budget grid.
 * Does not modify existing UI layout.
 * 
 * Now accepts budgets prop to calculate dynamically from actual budget data.
 */
export default function BudgetInsightsSummary({ month, year, budgets = [] }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (budgets && budgets.length > 0) {
            // Calculate from budgets data directly
            calculateInsights();
        } else {
            // Fallback to API if no budgets provided
            loadInsights();
        }
    }, [month, year, budgets]);

    const calculateInsights = () => {
        // Filter budgets for selected month/year
        const relevantBudgets = budgets.filter(
            (b) => b.month === month && b.year === year
        );

        if (relevantBudgets.length === 0) {
            setInsights(null);
            return;
        }

        // Calculate totals
        const totalBudget = relevantBudgets.reduce((sum, b) => sum + (b.limit_amount || 0), 0);
        const totalSpent = relevantBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
        const remainingAmount = totalBudget - totalSpent;
        const overallPercentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        // Count overspent categories
        const overspentCount = relevantBudgets.filter(
            (b) => (b.spent_amount || 0) > (b.limit_amount || 0)
        ).length;

        setInsights({
            total_budget: totalBudget,
            total_spent: totalSpent,
            remaining_amount: remainingAmount,
            overall_percent_used: overallPercentUsed,
            overspent_categories_count: overspentCount,
            categories_count: relevantBudgets.length
        });
    };

    const loadInsights = async () => {
        if (!month || !year) return;

        setLoading(true);
        try {
            const data = await apiFetch("get", `/budgets-enhanced/insights/${month}/${year}`);
            setInsights(data);
        } catch (err) {
            console.error("Error loading budget insights:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!insights || loading) {
        return null;
    }

    const getStatusColor = (percent) => {
        if (percent >= 100) return "#ef4444"; // Red
        if (percent >= 90) return "#f59e0b"; // Orange
        if (percent >= 60) return "#eab308"; // Yellow
        return "#22c55e"; // Green
    };

    const statusColor = getStatusColor(insights.overall_percent_used);

    return (
        <div className="budget-insights-summary">
            <div className="insights-header">
                <h3>Budget Summary - {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            </div>

            <div className="insights-grid">
                {/* Total Budget */}
                <div className="insight-card">
                    <div className="insight-icon">💰</div>
                    <div className="insight-content">
                        <p className="insight-label">Total Budget</p>
                        <p className="insight-value">₹{insights.total_budget?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="insight-card">
                    <div className="insight-icon">💸</div>
                    <div className="insight-content">
                        <p className="insight-label">Total Spent</p>
                        <p className="insight-value">₹{insights.total_spent?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Remaining */}
                <div className="insight-card">
                    <div className="insight-icon">✅</div>
                    <div className="insight-content">
                        <p className="insight-label">Remaining</p>
                        <p className="insight-value" style={{ color: insights.remaining_amount >= 0 ? '#22c55e' : '#ef4444' }}>
                            ₹{insights.remaining_amount?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* Overall % Used */}
                <div className="insight-card">
                    <div className="insight-icon">📊</div>
                    <div className="insight-content">
                        <p className="insight-label">Overall Used</p>
                        <p className="insight-value" style={{ color: statusColor, fontSize: '18px', fontWeight: 700 }}>
                            {insights.overall_percent_used?.toFixed(1)}%
                        </p>
                    </div>
                    <div className="insight-progress-ring">
                        <svg viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={statusColor}
                                strokeWidth="8"
                                strokeDasharray={`${(insights.overall_percent_used / 100) * 282.7} 282.7`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Overspent Alert */}
            {insights.overspent_categories_count > 0 && (
                <div className="insights-alert overspent-alert">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">
                        {insights.overspent_categories_count} {insights.overspent_categories_count === 1 ? 'category is' : 'categories are'} overspent!
                    </span>
                </div>
            )}

            {/* Summary Line */}
            <div className="insights-summary-line">
                <p>
                    You have {insights.categories_count} budget(s) set for this month.
                    {insights.remaining_amount >= 0
                        ? ` You have ₹${insights.remaining_amount?.toFixed(2)} remaining.`
                        : ` You are over budget by ₹${Math.abs(insights.remaining_amount)?.toFixed(2)}.`
                    }
                </p>
            </div>
        </div>
    );
}
