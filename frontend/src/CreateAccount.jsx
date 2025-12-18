// CreateAccount.jsx
import React, { useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

const API_BASE = "http://127.0.0.1:8000";

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const phoneValid = phone.length === 10;
  const phoneTooShort = phone.length > 0 && phone.length < 10;

  const validateAll = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Please enter your full name.";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!isValidEmail(email)) e.email = "Please enter a valid email.";
    if (!phone) e.phone = "Please enter phone number.";
    else if (phone.length !== 10) e.phone = "Phone number must be 10 digits.";
    if (!password) e.password = "Please create a password.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirm) e.confirm = "Please re-enter your password.";
    if (password && confirm && password !== confirm) e.confirm = "Passwords do not match.";
    if (!agree) e.agree = "You must accept the Terms & Privacy Policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateAll()) return;
    setServerError("");
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: fullName,
        email,
        phone,
        password,
      });

      navigate("login");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed";
      setServerError(msg);
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

          <h1 className="signin-title">Create Account</h1>
          <p className="signin-subtitle">
            Join FinBank and start your digital banking journey.
          </p>

          {serverError && <div className="form-error">{serverError}</div>}

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
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className="field-group">
            <label className="field-label">Phone Number</label>
            <div
              className={`field-input-wrapper ${
                phoneValid ? "phone-valid" : phoneTooShort ? "phone-invalid" : ""
              }`}
            >
              <span className="field-icon">📱</span>
              <input
                type="tel"
                className="field-input"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPhone(val);
                  setErrors((p) => ({ ...p, phone: undefined }));
                }}
              />
            </div>
            {phoneTooShort && (
              <div className="form-error">Enter exactly 10 digits</div>
            )}
            {phoneValid && (
              <div className="form-success">Valid phone number ✓</div>
            )}
            {errors.phone && <div className="form-error">{errors.phone}</div>}
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
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="pw-strength-row">
              <div className={`pw-strength-bar pw-strength-${strength.label.toLowerCase()}`}>
                <div
                  className="pw-strength-fill"
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
              <div className="pw-strength-text">{strength.label}</div>
            </div>

            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Confirm */}
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>
              <input
                type={showConfirm ? "text" : "password"}
                className="field-input"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowConfirm((c) => !c)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            {confirm && password === confirm && (
              <div className="form-success">Passwords match ✓</div>
            )}
            {confirm && password !== confirm && (
              <div className="form-error">Passwords do not match</div>
            )}
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          {/* Terms */}
          <div className="terms-row">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree to the <b>Terms & Privacy Policy</b>
              </span>
            </label>
            {errors.agree && <div className="form-error">{errors.agree}</div>}
          </div>

          <button
            className="primary-button"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

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
