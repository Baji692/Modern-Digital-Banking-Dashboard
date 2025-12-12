// CreateAccount.jsx
import React, { useState, useMemo } from "react";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";

import bankIcon from "./bank.png";

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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function CreateAccount({ navigate }) {
  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  // visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // errors
  const [errors, setErrors] = useState({});

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const passwordsMatch = password && confirm && password === confirm;

  const validateAll = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Please enter your full name.";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!isValidEmail(email)) e.email = "Please enter a valid email.";
    if (!password) e.password = "Please create a password.";
    else if (password.length < 8) e.password = "Password should be at least 8 characters.";
    if (!confirm) e.confirm = "Please re-enter your password.";
    if (password && confirm && password !== confirm) e.confirm = "Passwords do not match.";
    if (!agree) e.agree = "You must accept the Terms & Privacy Policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validateAll()) return;

    // Here you would call the API to create account.
    // For prototype, we navigate back to login.
    navigate && navigate("login");
  };

  return (
    <div className="app-root">
         {/* Top-left Logo */}
  <div className="top-left-logo">
    <img src={finBankLogo} alt="FinBank Logo" className="top-logo-img" />
  </div>
      <div className="auth-card-single">
        <section className="signin-pane">
          <div className="signin-logo-circle">
            <img src={bankIcon} alt="Bank Icon" className="signin-logo-icon" />
          </div>

          <h1 className="signin-title">Create Account</h1>
          <p className="signin-subtitle">
            Join FinBank and start your digital banking journey.
          </p>

          {/* Full Name */}
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🧑‍💼</span>
              <input
                type="text"
                className="field-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <div className="form-error">{errors.fullName}</div>}
          </div>

          {/* Email */}
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
                autoComplete="email"
                onBlur={() => {
                  if (email && !isValidEmail(email)) setErrors((p) => ({ ...p, email: "Invalid email." }));
                  else setErrors((p) => ({ ...p, email: undefined }));
                }}
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                className="field-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // clear confirm mismatch while typing
                  setErrors((p) => ({ ...p, confirm: undefined, password: undefined }));
                }}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* strength meter */}
            <div className="pw-strength-row">
              <div className={"pw-strength-bar pw-strength-" + strength.label.toLowerCase()}>
                <div
                  className="pw-strength-fill"
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
              <div className="pw-strength-text">{strength.label}</div>
            </div>

            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>

              <input
                type={showConfirm ? "text" : "password"}
                className="field-input"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowConfirm((c) => !c)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            {/* match indicator */}
            {confirm ? (
              passwordsMatch ? (
                <div className="form-success">Passwords match ✓</div>
              ) : (
                <div className="form-error">Passwords do not match</div>
              )
            ) : null}

            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          {/* Terms Checkbox */}
          <div className="terms-row">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => {
                  setAgree(e.target.checked);
                  setErrors((p) => ({ ...p, agree: undefined }));
                }}
              />
              <span>
                I agree to the <b>Terms & Privacy Policy</b>
              </span>
            </label>
            {errors.agree && <div className="form-error">{errors.agree}</div>}
          </div>

          {/* Create Account Button */}
          <button
            className="primary-button"
            onClick={handleCreate}
            disabled={!fullName || !email || !password || !confirm || !agree}
            style={{
              opacity: !fullName || !email || !password || !confirm || !agree ? 0.6 : 1,
              cursor: !fullName || !email || !password || !confirm || !agree ? "not-allowed" : "pointer",
            }}
          >
            Create Account
          </button>

          {/* Footer */}
          <div className="signin-footer">
            <span>Already have an account?</span>
            <button className="link-button" onClick={() => navigate("login")}>
              Sign In
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateAccount;
