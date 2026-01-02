import React, { useState, useEffect } from "react";

const Rewards = () => {
  /* ------------------ User-driven inputs ------------------ */
  const [budget, setBudget] = useState("");
  const [spent, setSpent] = useState("");
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);

  /* ------------------ Real-time reward logic ------------------ */
  useEffect(() => {
    const b = Number(budget);
    const s = Number(spent);

    if (b > 0 && s >= 0) {
      let reward = 0;
      const remaining = b - s;
      const usage = (s / b) * 100;

      if (remaining > 0) reward += Math.floor(remaining / 100) * 10;
      if (usage < 80) reward += 50;
      if (usage >= 90 && usage < 100) reward -= 20;
      if (usage >= 100) reward -= 50;

      setPoints(reward);

      setHistory((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          budget: b,
          spent: s,
          points: reward,
        },
        ...prev.slice(0, 4),
      ]);
    }
  }, [budget, spent]);

  return (
    <div className="rewards-page">
      <h2>Rewards</h2>
      <p className="subtitle">Earn points by managing your budget smartly</p>

      {/* -------- User Input -------- */}
      <div className="input-box">
        <input
          type="number"
          placeholder="Total Budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount Spent (₹)"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
        />
      </div>

      {/* -------- Reward Summary -------- */}
      <div className="reward-card">
        <h3>Total Reward Points</h3>
        <div className="points">{points}</div>
        <p className="info">Updates instantly based on your input</p>
      </div>

      {/* -------- Reward Rules -------- */}
      <div className="rules">
        <h4>Reward Rules</h4>
        <ul>
          <li>₹100 saved → +10 points</li>
          <li>Usage below 80% → +50 points</li>
          <li>Near limit (90–99%) → −20 points</li>
          <li>Over budget → −50 points</li>
        </ul>
      </div>

      {/* -------- Activity -------- */}
      <div className="history">
        <h4>Recent Activity</h4>
        {history.length === 0 ? (
          <p>No activity yet</p>
        ) : (
          history.map((h, i) => (
            <div key={i} className="history-row">
              <span>{h.time}</span>
              <span>Budget ₹{h.budget}</span>
              <span>Spent ₹{h.spent}</span>
              <strong>{h.points} pts</strong>
            </div>
          ))
        )}
      </div>

      {/* -------- CSS (Integrated) -------- */}
      <style>{`
        .rewards-page {
          padding: 28px;
          color: #fff;
        }

        .subtitle {
          opacity: 0.8;
          margin-bottom: 20px;
        }

        .input-box {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .input-box input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: none;
          outline: none;
        }

        .reward-card {
          background: #ffffff;
          color: #000;
          padding: 22px;
          border-radius: 14px;
          width: 300px;
          margin-bottom: 25px;
        }

        .points {
          font-size: 42px;
          font-weight: bold;
          color: #2563eb;
        }

        .info {
          font-size: 13px;
          opacity: 0.7;
        }

        .rules {
          background: rgba(255,255,255,0.1);
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .rules ul {
          padding-left: 20px;
          margin-top: 8px;
        }

        .history {
          background: #ffffff;
          color: #000;
          padding: 18px;
          border-radius: 12px;
        }

        .history-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          font-size: 14px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default Rewards;

