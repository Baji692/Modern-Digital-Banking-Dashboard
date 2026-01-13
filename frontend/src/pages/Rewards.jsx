import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Rewards() {
  const [transactions, setTransactions] = useState([]);
  const [rewardBreakdown, setRewardBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await apiFetch("get", "/transactions/");
        setTransactions(data || []);
        calculateRewards(data || []);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const calculateRewards = (txns) => {
    const breakdown = {
      shopping: 0,
      dining: 0,
      utilities: 0,
      groceries: 0,
      other: 0,
    };

    txns.forEach((t) => {
      if (t.txn_type === "debit") {
        const amount = Number(t.amount);
        const category = (t.category || "").toLowerCase();

        if (category.includes("shopping") || category.includes("retail")) {
          breakdown.shopping += Math.floor(amount * 0.02); // 2% for shopping
        } else if (category.includes("dining") || category.includes("food")) {
          breakdown.dining += Math.floor(amount * 0.03); // 3% for dining
        } else if (category.includes("utilities")) {
          breakdown.utilities += Math.floor(amount * 0.01); // 1% for utilities
        } else if (category.includes("groceries")) {
          breakdown.groceries += Math.floor(amount * 0.015); // 1.5% for groceries
        } else {
          breakdown.other += Math.floor(amount * 0.01); // 1% for others
        }
      }
    });

    setRewardBreakdown(breakdown);
  };

  const totalRewardPoints = Object.values(rewardBreakdown).reduce(
    (a, b) => a + b,
    0
  );
  const rewardValue = Math.round(totalRewardPoints / 100); // 1 point = ₹1

  const rewardTiers = [
    {
      name: "Silver",
      minPoints: 0,
      maxPoints: 5000,
      benefits: "1% cashback on all purchases",
      status: totalRewardPoints < 5000 ? "Current" : "Achieved",
    },
    {
      name: "Gold",
      minPoints: 5000,
      maxPoints: 15000,
      benefits: "2% cashback on all purchases, Priority support",
      status:
        totalRewardPoints >= 5000 && totalRewardPoints < 15000
          ? "Current"
          : totalRewardPoints >= 15000
            ? "Achieved"
            : "Locked",
    },
    {
      name: "Platinum",
      minPoints: 15000,
      maxPoints: 50000,
      benefits: "3% cashback, Premium concierge, Exclusive offers",
      status:
        totalRewardPoints >= 15000 && totalRewardPoints < 50000
          ? "Current"
          : totalRewardPoints >= 50000
            ? "Achieved"
            : "Locked",
    },
    {
      name: "Diamond",
      minPoints: 50000,
      maxPoints: Infinity,
      benefits: "5% cashback, VIP treatment, Personalized offers",
      status: totalRewardPoints >= 50000 ? "Current" : "Locked",
    },
  ];

  if (loading) return <p style={{ color: "#ffffff" }}>Loading rewards...</p>;

  return (
    <>
      <h2 className="dash-title">Rewards & Benefits</h2>
      <p className="dash-sub">Earn points on every transaction</p>

      {/* Total Rewards Summary */}
      <div className="grid">
        <div className="glass-card reward-summary">
          <span>Total Reward Points</span>
          <strong>{totalRewardPoints.toLocaleString()}</strong>
          <small>≈ ₹{rewardValue.toLocaleString()} value</small>
        </div>

        <div className="glass-card reward-summary">
          <span>Points This Month</span>
          <strong>
            {Object.values(rewardBreakdown).reduce((a, b) => a + b, 0)}
          </strong>
          <small>Based on spending</small>
        </div>

        <div className="glass-card reward-summary">
          <span>Redemption Options</span>
          <strong>5+</strong>
          <small>Cashback, Gift cards, Travel</small>
        </div>

        <div className="glass-card reward-summary">
          <span>Current Tier</span>
          <strong>
            {rewardTiers.find((t) => t.status === "Current")?.name || "Silver"}
          </strong>
          <small>Level up with more spending</small>
        </div>
      </div>

      {/* Reward Breakdown by Category */}
      <div className="reward-section">
        <h3 style={{ color: "#ffffff", marginBottom: "20px" }}>
          Points by Category
        </h3>
        <div className="grid">
          {[
            { key: "shopping", label: "Shopping", icon: "🛍️" },
            { key: "dining", label: "Dining", icon: "🍽️" },
            { key: "groceries", label: "Groceries", icon: "🛒" },
            { key: "utilities", label: "Utilities", icon: "⚡" },
            { key: "other", label: "Other", icon: "📌" },
          ].map((cat) => (
            <div key={cat.key} className="glass-card reward-card">
              <span className="reward-icon">{cat.icon}</span>
              <strong>{cat.label}</strong>
              <p className="reward-points">{rewardBreakdown[cat.key]} pts</p>
              <small>
                {(
                  (rewardBreakdown[cat.key] / (totalRewardPoints || 1)) *
                  100
                ).toFixed(0)}
                %
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="reward-section">
        <h3 style={{ color: "#ffffff", marginBottom: "20px" }}>
          Membership Tiers
        </h3>
        <div className="tiers-container">
          {rewardTiers.map((tier, i) => {
            const isLocked = tier.status === "Locked";
            const isCurrent = tier.status === "Current";

            return (
              <div
                key={i}
                className={`tier-card ${isCurrent ? "active" : ""} ${isLocked ? "locked" : ""
                  }`}
              >
                <div className="tier-header">
                  <h4>{tier.name}</h4>
                  <span className="tier-badge">{tier.status}</span>
                </div>

                <div className="tier-points">
                  {tier.minPoints.toLocaleString()}+
                  {tier.maxPoints !== Infinity
                    ? ` - ${tier.maxPoints.toLocaleString()}`
                    : " points"}
                </div>

                <div className="tier-benefits">{tier.benefits}</div>

                {isCurrent && (
                  <div className="tier-progress">
                    <div className="progress-label">
                      {totalRewardPoints} / {tier.maxPoints}{" "}
                      {tier.maxPoints !== Infinity ? "points" : ""}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width:
                            tier.maxPoints === Infinity
                              ? "100%"
                              : `${((totalRewardPoints - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemption Options */}
      <div className="reward-section">
        <h3 style={{ color: "#ffffff", marginBottom: "20px" }}>
          Redeem Your Points
        </h3>
        <div className="grid">
          {[
            {
              name: "Cashback",
              value: "1 point = ₹1",
              minPoints: 100,
              icon: "💰",
            },
            {
              name: "Gift Cards",
              value: "Amazon, Flipkart, etc.",
              minPoints: 500,
              icon: "🎁",
            },
            {
              name: "Travel",
              value: "Flight bookings, Hotels",
              minPoints: 1000,
              icon: "✈️",
            },
            {
              name: "Shopping",
              value: "Partner brand vouchers",
              minPoints: 300,
              icon: "🛍️",
            },
          ].map((option, i) => (
            <div key={i} className="glass-card redemption-card">
              <span className="redemption-icon">{option.icon}</span>
              <strong>{option.name}</strong>
              <p>{option.value}</p>
              <button
                className="redeem-btn"
                disabled={totalRewardPoints < option.minPoints}
              >
                {totalRewardPoints >= option.minPoints ? "Redeem" : "Locked"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
