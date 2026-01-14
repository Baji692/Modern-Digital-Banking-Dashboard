// ResetPasswordNewPassword.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

const API_BASE = "http://127.0.0.1:9000";

/* ---------- PASSWORD STRENGTH ---------- */
function evaluateStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak" };
  if (score === 2) return { score, label: "Fair" };
  if (score === 3) return { score, label: "Good" };
  return { score, label: "Strong" };
}

function ResetPasswordNewPassword({ navigate }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(
    () => evaluateStrength(newPassword),
    [newPassword]
  );

  const email = sessionStorage.getItem("reset_email");
  const otp = sessionStorage.getItem("reset_otp");

  // ✅ prevents guard firing after success
  const completedRef = useRef(false);

  /* 🔐 SESSION GUARD */
  useEffect(() => {
    if (completedRef.current) return;

    if (!email || !otp) {
      toast.error("Password reset session expired");
      navigate("resetEmail");
    }
  }, [email, otp, navigate]);

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const validateAll = () => {
    const e = {};
    if (!newPassword) e.newPassword = "Please enter a new password.";
    else if (newPassword.length < 8)
      e.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword)
      e.confirmPassword = "Please confirm your new password.";
    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* 🔐 FINAL RESET */
  const handleSetPassword = async () => {
    if (!validateAll()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    if (strength.label === "Weak") {
      toast.error("Please choose a stronger password");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      });

      completedRef.current = true; // ✅ STOP GUARD

      toast.success("Password reset successfully 🔐");

      // cleanup AFTER success
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");

      setTimeout(() => {
        navigate("login");
      }, 1200);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI (UNCHANGED) ---------- */
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
          <p className="signin-subtitle">Setup a New Password</p>

          <div className="field-group">
            <label className="field-label">New Password</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>
              <input
                type={showNew ? "text" : "password"}
                className="field-input"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowNew((s) => !s)}
              >
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="pw-strength-row">
              <div
                className={
                  "pw-strength-bar pw-strength-" +
                  strength.label.toLowerCase()
                }
              >
                <div
                  className="pw-strength-fill"
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
              <div className="pw-strength-text">{strength.label}</div>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Confirm New Password</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>
              <input
                type={showConfirm ? "text" : "password"}
                className="field-input"
                placeholder="Re-enter New Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowConfirm((s) => !s)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            {confirmPassword &&
              (passwordsMatch ? (
                <div className="form-success">Passwords match ✓</div>
              ) : (
                <div className="form-error">Passwords do not match</div>
              ))}
          </div>

          <button
            className="primary-button"
            onClick={handleSetPassword}
            disabled={loading || !passwordsMatch}
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>

          <div className="reset-footer">
            <button className="link-button" onClick={() => navigate("login")}>
              Back to Login
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPasswordNewPassword;
