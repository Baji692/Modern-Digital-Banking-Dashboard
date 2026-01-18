import React, { useState, useEffect } from 'react';
import './BudgetRecommendation.css';
import { apiFetch } from '../api';

const BudgetRecommendationPanel = ({ month, year, onApply }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        loadRecommendations();
    }, [month, year]);

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('GET', `/budgets-enhanced/recommendations/generate/6`);
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (category, recommendedAmount) => {
        setApplying(category);
        try {
            await apiFetch('POST', `/budgets-enhanced/recommendations/apply/${category}`, {
                recommended_limit: recommendedAmount,
                month,
                year
            });

            // Call parent callback to refresh budget list
            if (onApply) {
                onApply();
            }

            // Remove recommendation from list
            setRecommendations(recommendations.filter(r => r.category !== category));
        } catch (error) {
            console.error('Failed to apply recommendation:', error);
            alert('Could not apply recommendation. Please try again.');
        } finally {
            setApplying(null);
        }
    };

    if (!recommendations.length) {
        return null;
    }

    return (
        <div className="budget-recommendation-panel">
            <div
                className="recommendation-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="recommendation-title">
                    <span className="recommendation-icon">💡</span>
                    <h3>AI Budget Recommendations</h3>
                </div>
                <span className={`recommendation-badge ${recommendations.length > 0 ? 'active' : ''}`}>
                    {recommendations.length}
                </span>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
            </div>

            {isExpanded && (
                <div className="recommendations-list">
                    {loading ? (
                        <div className="loading-spinner">Loading recommendations...</div>
                    ) : (
                        recommendations.map((rec, idx) => (
                            <div key={idx} className="recommendation-item">
                                <div className="recommendation-content">
                                    <div className="rec-category">{rec.category}</div>
                                    <div className="rec-details">
                                        <span className="rec-avg">Avg Spent: ₹{rec.average_spending?.toFixed(2) || '0.00'}</span>
                                        <span className="rec-confidence">
                                            Confidence: {Math.round((rec.confidence || 0) * 100)}%
                                        </span>
                                    </div>
                                    <div className="rec-message">{rec.message}</div>
                                </div>

                                <div className="recommendation-value">
                                    <div className="rec-recommended">
                                        <span className="rec-label">Recommended</span>
                                        <span className="rec-amount">₹{rec.recommended_limit?.toFixed(2) || '0.00'}</span>
                                    </div>

                                    <button
                                        className={`apply-button ${applying === rec.category ? 'loading' : ''}`}
                                        onClick={() => handleApply(rec.category, rec.recommended_limit)}
                                        disabled={applying === rec.category}
                                    >
                                        {applying === rec.category ? '⏳ Applying...' : '✓ Apply'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BudgetRecommendationPanel;
