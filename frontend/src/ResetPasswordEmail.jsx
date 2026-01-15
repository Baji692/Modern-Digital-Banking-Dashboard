// ResetPasswordEmail.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

const API_BASE = "http://127.0.0.1:8000";

function ResetPasswordEmail({ navigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });

      // ✅ CRITICAL FIX
      sessionStorage.setItem("reset_email", email);

      toast.success("OTP sent to your email 📧");

      setTimeout(() => {
        navigate("resetOtp");
      }, 1200);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <div className="top-left-logo">
        <img src={finBankLogo} alt="FinBank Logo" className="top-logo-img" />
      </div>

      <div className="auth-card-single">
        <section className="signin-pane">
          <div className="signin-logo-circle">
            <img src={bankIcon} alt="Bank Icon" className="signin-logo-icon" />
          </div>

          <h1 className="signin-title">Reset Password</h1>
          <p className="signin-subtitle">Enter your registered email</p>

          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="field-input-wrapper">
              <span className="field-icon">📧</span>
              <input
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
          </div>

          <button
            className="primary-button"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div className="signin-footer" style={{ justifyContent: "center" }}>
            <button className="link-button" onClick={() => navigate("login")}>
              Back to Login
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPasswordEmail;
