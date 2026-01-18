import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "./BudgetAlerts.css";

/**
 * BudgetAlertsPanel - Smart alerts system:
 * - Threshold warnings (80%, 90%, 100%)
 * - Overspending predictions
 * - Mark as read functionality
 * 
 * Displayed as a collapsible panel addon.
 */
export default function BudgetAlertsPanel({ month, year }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadAlerts();
    }, [month, year]);

    const loadAlerts = async () => {
        if (!month || !year) return;

        setLoading(true);
        try {
            const data = await apiFetch("get", `/budgets-enhanced/alerts/${month}/${year}`);
            setAlerts(data || []);
            setUnreadCount(data?.filter(a => !a.is_read).length || 0);
        } catch (err) {
            console.error("Error loading alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId) => {
        try {
            await apiFetch("post", `/budgets-enhanced/alerts/mark-read/${alertId}`);
            setAlerts(prev =>
                prev.map(a => a.id === alertId ? { ...a, is_read: true } : a)
            );
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (err) {
            console.error("Error marking alert as read:", err);
        }
    };

    const getAlertIcon = (alertType) => {
        switch (alertType) {
            case "THRESHOLD_80":
                return "🟡"; // Yellow - 80%
            case "THRESHOLD_90":
                return "🟠"; // Orange - 90%
            case "THRESHOLD_100":
                return "🔴"; // Red - 100%
            case "PREDICTION":
                return "⚡"; // Lightning - Prediction
            default:
                return "ℹ️";
        }
    };

    const getAlertSeverity = (alertType) => {
        switch (alertType) {
            case "THRESHOLD_100":
            case "PREDICTION":
                return "critical";
            case "THRESHOLD_90":
                return "high";
            case "THRESHOLD_80":
                return "medium";
            default:
                return "low";
        }
    };

    if (!alerts || alerts.length === 0) {
        return null;
    }

    return (
        <div className="budget-alerts-panel">
            <div
                className="alerts-header"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ cursor: 'pointer' }}
            >
                <div className="alerts-title">
                    <span className="alerts-icon">🚨</span>
                    <span>Budget Alerts</span>
                    {unreadCount > 0 && (
                        <span className="alert-badge">{unreadCount}</span>
                    )}
                </div>
                <span className="expand-icon" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                </span>
            </div>

            {isExpanded && (
                <div className="alerts-list">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`alert-item ${getAlertSeverity(alert.alert_type)} ${alert.is_read ? 'read' : 'unread'}`}
                            onClick={() => !alert.is_read && markAsRead(alert.id)}
                        >
                            <div className="alert-icon-large">
                                {getAlertIcon(alert.alert_type)}
                            </div>

                            <div className="alert-content">
                                <div className="alert-category">{alert.category}</div>
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-meta">
                                    {alert.threshold_reached > 0 && (
                                        <span className="alert-threshold">
                                            {alert.threshold_reached}% used • ₹{alert.current_spending?.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!alert.is_read && (
                                <div className="alert-unread-indicator" title="Click to mark as read"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
