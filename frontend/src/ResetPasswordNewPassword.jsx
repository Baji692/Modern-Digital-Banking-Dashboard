// ResetPasswordNewPassword.jsx
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify"; // ✅ added
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

/** Same strength evaluator used in CreateAccount for consistent UX */
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
  const strength = useMemo(() => evaluateStrength(newPassword), [newPassword]);

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

  const handleSetPassword = async () => {
    if (!validateAll()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    if (strength.label === "Weak") {
      toast.error("Please choose a stronger password");
      return;
    }

    try {
      // 🔁 Replace with real API later:
      // await axios.post("/auth/reset-password", {...})

      toast.success("Password reset successfully 🔐");

      setTimeout(() => {
        navigate && navigate("login");
      }, 1500);
    } catch (err) {
      toast.error("Failed to reset password. Try again.");
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
          <p className="signin-subtitle">Setup a New Password</p>

          {/* New Password */}
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
                  setErrors((p) => ({
                    ...p,
                    newPassword: undefined,
                    confirmPassword: undefined,
                  }));
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowNew((s) => !s)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>

            {/* strength meter */}
            <div className="pw-strength-row" style={{ marginTop: 8 }}>
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

            {errors.newPassword && (
              <div className="form-error">{errors.newPassword}</div>
            )}
          </div>

          {/* Confirm New Password */}
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
                  setErrors((p) => ({
                    ...p,
                    confirmPassword: undefined,
                  }));
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            {/* match indicator */}
            {confirmPassword ? (
              passwordsMatch ? (
                <div className="form-success">Passwords match ✓</div>
              ) : (
                <div className="form-error">Passwords do not match</div>
              )
            ) : null}

            {errors.confirmPassword && (
              <div className="form-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            className="primary-button"
            onClick={handleSetPassword}
            disabled={!newPassword || !confirmPassword || !passwordsMatch}
            style={{
              opacity:
                !newPassword || !confirmPassword || !passwordsMatch ? 0.6 : 1,
              cursor:
                !newPassword || !confirmPassword || !passwordsMatch
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Set Password
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
