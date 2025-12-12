// App.js
import React, { useState } from "react";
import "./App.css";

import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

// Import screens
import CreateAccount from "./CreateAccount";
import ResetPasswordEmail from "./ResetPasswordEmail";
import ResetPasswordOtp from "./ResetPasswordOtp";
import ResetPasswordNewPassword from "./ResetPasswordNewPassword";
import Dashboard from "./Dashboard";

/* ---------------- EMAIL VALIDATION ---------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   LOGIN PAGE (Centered card + FinBank top-left)
   ============================================================ */
function LoginPage({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* ---- SIGN IN HANDLER ---- */
  const handleSignIn = () => {
    setEmailError("");
    setPasswordError("");

    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      valid = false;
    }

    if (!valid) return;

    // Success → Go to dashboard
    navigate("dashboard");
  };

  return (
    <div className="app-root">

      {/* ---------- TOP-LEFT FINBANK LOGO ---------- */}
      {/* TOP-LEFT: professional wordmark */}
<div className="top-left-logo">
  <img src={finBankLogo} alt="FinBank Logo" className="top-logo-img" />
</div>



      {/* ---------- CENTERED LOGIN CARD ---------- */}
      <div className="auth-card-single">
        <section className="signin-pane">

          {/* Icon */}
          <div className="signin-logo-circle">
            <img src={bankIcon} alt="Bank Icon" className="signin-logo-icon" />
          </div>

          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to your Banking Dashboard</p>

          {/* EMAIL FIELD */}
          <div className="field-group">
            <label className="field-label">Email Address</label>

            <div className="field-input-wrapper">
              <span className="field-icon">📧</span>
              <input
                type="email"
                className="field-input"
                placeholder="demo@banking.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (email && !isValidEmail(email)) setEmailError("Invalid email.");
                }}
                autoComplete="email"
              />
            </div>

            {emailError && <div className="form-error">{emailError}</div>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="field-group">
            <label className="field-label">Password</label>

            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                className="field-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              {/* Eye Toggle */}
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {passwordError && <div className="form-error">{passwordError}</div>}
          </div>

          {/* REMEMBER + FORGOT ROW */}
          <div className="signin-options-row">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button className="link-button" onClick={() => navigate("resetEmail")}>
              Forgot password?
            </button>
          </div>

          {/* SIGN IN BUTTON */}
          <button className="primary-button" onClick={handleSignIn}>
            Sign In
          </button>

          {/* FOOTER */}
          <div className="signin-footer">
            <span>Don't have an account?</span>
            <button className="link-button" onClick={() => navigate("create")}>
              Create Account
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP ROUTER
   ============================================================ */

function App() {
  const [screen, setScreen] = useState("login");

  const navigate = (screenName) => setScreen(screenName);

  switch (screen) {
    case "login":
      return <LoginPage navigate={navigate} />;

    case "create":
      return <CreateAccount navigate={navigate} />;

    case "resetEmail":
      return <ResetPasswordEmail navigate={navigate} />;

    case "resetOtp":
      return <ResetPasswordOtp navigate={navigate} />;

    case "resetNewPassword":
      return <ResetPasswordNewPassword navigate={navigate} />;

    case "dashboard":
      return <Dashboard navigate={navigate} />;

    default:
      return <LoginPage navigate={navigate} />;
  }
}

export default App;
