import React from "react";
import { useBudgets } from "./Budgets";

/* ===============================
   INLINE CSS
   =============================== */
const styles = {
  page: {
    padding: 24,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: 6,
    fontSize: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: 8,
  },
};

/* ===============================
   HELPER FUNCTIONS
   =============================== */

// Generate SVG arc for pie chart
const polarToCartesian = (cx, cy, r, angle) => {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#ef4444", "#8b5cf6"];

/* ===============================
   INSIGHTS COMPONENT
   =============================== */

const Insights = () => {
  const { budgets } = useBudgets();

  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  let cumulativeAngle = 0;

  return (
    <div style={styles.page}>
      <h2>Insights (Real-Time)</h2>
      <p>Automatically generated from user budgets</p>

      {budgets.length === 0 && (
        <div style={styles.card}>
          <p>No data available.</p>
          <p>Please add budgets to view insights.</p>
        </div>
      )}

      {budgets.length > 0 && (
        <div style={styles.chartRow}>
          {/* ================= PIE CHART ================= */}
          <div style={styles.card}>
            <h4>Spending Distribution</h4>

            <svg width="220" height="220" viewBox="0 0 220 220">
              {budgets.map((b, i) => {
                const value = totalSpent === 0 ? 0 : (b.spent / totalSpent) * 360;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + value;
                cumulativeAngle += value;

                return (
                  <path
                    key={i}
                    d={describeArc(110, 110, 90, startAngle, endAngle)}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="20"
                  />
                );
              })}
            </svg>

            {/* Legend */}
            {budgets.map((b, i) => (
              <div key={i} style={styles.legendItem}>
                <div
                  style={{
                    ...styles.dot,
                    background: COLORS[i % COLORS.length],
                  }}
                />
                {b.name} – ₹{b.spent}
              </div>
            ))}
          </div>

          {/* ================= LINE GRAPH ================= */}
          <div style={styles.card}>
            <h4>Spending Trend</h4>

            <svg width="260" height="180">
              {/* Axis */}
              <line x1="30" y1="10" x2="30" y2="150" stroke="#94a3b8" />
              <line x1="30" y1="150" x2="240" y2="150" stroke="#94a3b8" />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={budgets
                  .map((b, i) => {
                    const x = 30 + i * (200 / Math.max(budgets.length - 1, 1));
                    const y =
                      150 -
                      (b.spent /
                        Math.max(
                          ...budgets.map((x) => x.spent),
                          1
                        )) *
                        120;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Points */}
              {budgets.map((b, i) => {
                const x = 30 + i * (200 / Math.max(budgets.length - 1, 1));
                const y =
                  150 -
                  (b.spent /
                    Math.max(...budgets.map((x) => x.spent), 1)) *
                    120;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#2563eb"
                  />
                );
              })}
            </svg>

            <p style={{ fontSize: 13 }}>
              Line updates instantly when user spending changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;

