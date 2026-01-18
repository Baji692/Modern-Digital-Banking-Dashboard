import React, { useState, useEffect } from 'react';
import './BudgetHistory.css';
import { apiFetch } from '../api';

const BudgetHistoryChart = ({ category, month, year }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxSpent, setMaxSpent] = useState(0);

    useEffect(() => {
        loadHistory();
    }, [category, month, year]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('GET', `/budgets-enhanced/history/${category}`);
            const records = data.history || [];
            setHistoryData(records);

            // Calculate max for scaling
            const max = Math.max(...records.map(r => r.amount_spent || 0));
            setMaxSpent(max || 100);
        } catch (error) {
            console.error('Failed to load history:', error);
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !historyData.length) {
        return null;
    }

    const getStatusColor = (percentUsed) => {
        if (percentUsed < 60) return '#4ade80';
        if (percentUsed < 90) return '#facc15';
        if (percentUsed < 100) return '#fb923c';
        return '#ef4444';
    };

    const last6Months = historyData.slice(-6);

    return (
        <div className="budget-history-chart">
            <div className="history-title">{category} - 6 Month Trend</div>

            <div className="chart-container">
                <div className="chart-bars">
                    {last6Months.map((record, idx) => {
                        const percentUsed = (record.amount_spent / (record.budget_limit || 1)) * 100;
                        const barHeight = (record.amount_spent / maxSpent) * 100;
                        const color = getStatusColor(Math.min(percentUsed, 100));

                        return (
                            <div key={idx} className="bar-container">
                                <div className="bar-label">{record.month || 'N/A'}</div>
                                <div className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${Math.max(barHeight, 5)}%`,
                                            backgroundColor: color,
                                            opacity: 0.8
                                        }}
                                        title={`₹${record.amount_spent?.toFixed(2) || '0'} / ₹${record.budget_limit?.toFixed(2) || '0'}`}
                                    />
                                </div>
                                <div className="bar-value">₹{Math.round(record.amount_spent || 0)}</div>
                                <div className="bar-percent">{Math.round(percentUsed)}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="trend-summary">
                {(() => {
                    const recent = historyData[historyData.length - 1];
                    const previous = historyData[historyData.length - 2];
                    if (!recent || !previous) return null;

                    const change = recent.amount_spent - previous.amount_spent;
                    const changePercent = ((change / previous.amount_spent) * 100).toFixed(1);
                    const trend = change > 0 ? '📈 up' : '📉 down';

                    return (
                        <p className="trend-text">
                            Spending {trend} {Math.abs(changePercent)}% month-over-month
                        </p>
                    );
                })()}
            </div>
        </div>
    );
};

export default BudgetHistoryChart;
