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
 */
export default function BudgetInsightsSummary({ month, year }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInsights();
    }, [month, year]);

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p className="insight-value" style={{ color: statusColor }}>
                                {insights.overall_percent_used?.toFixed(1)}%
                            </p>
                            <div
                                className="insight-progress-ring"
                                style={{
                                    background: `conic-gradient(${statusColor} 0deg ${(insights.overall_percent_used / 100) * 360}deg, rgba(255,255,255,0.1) ${(insights.overall_percent_used / 100) * 360}deg 360deg)`
                                }}
                            ></div>
                        </div>
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
