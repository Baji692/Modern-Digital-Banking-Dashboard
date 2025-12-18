// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

// Screens
import CreateAccount from "./CreateAccount";
import ResetPasswordEmail from "./ResetPasswordEmail";
import ResetPasswordOtp from "./ResetPasswordOtp";
import ResetPasswordNewPassword from "./ResetPasswordNewPassword";
import Dashboard from "./Dashboard";

const API_BASE = "http://127.0.0.1:8000";

/* ---------------- EMAIL VALIDATION ---------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function LoginPage({ navigate, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setEmailError("");
    setPasswordError("");
    setServerError("");

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

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const userData = {
        name: res.data.name,
        email: res.data.email,
      };

      // Save session
      localStorage.setItem("finbank_user", JSON.stringify(userData));
      setUser(userData);

      navigate("dashboard");
    } catch (err) {
      setServerError(err?.response?.data?.detail || "Invalid credentials");
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

          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to your Banking Dashboard</p>

          {serverError && <div className="form-error">{serverError}</div>}

          {/* EMAIL */}
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
                autoComplete="email"
              />
            </div>
            {emailError && <div className="form-error">{emailError}</div>}
          </div>

          {/* PASSWORD */}
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
              />
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

          <div className="signin-options-row">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button className="link-button" onClick={() => navigate("resetEmail")}>
              Forgot password?
            </button>
          </div>

          <button className="primary-button" onClick={handleSignIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

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
   MAIN APP
   ============================================================ */

function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);

  const navigate = (screenName) => setScreen(screenName);

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("finbank_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setScreen("dashboard");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("finbank_user");
    setUser(null);
    navigate("login");
  };

  switch (screen) {
    case "login":
      return <LoginPage navigate={navigate} setUser={setUser} />;

    case "create":
      return <CreateAccount navigate={navigate} />;

    case "resetEmail":
      return <ResetPasswordEmail navigate={navigate} />;

    case "resetOtp":
      return <ResetPasswordOtp navigate={navigate} />;

    case "resetNewPassword":
      return <ResetPasswordNewPassword navigate={navigate} />;

    case "dashboard":
      return <Dashboard navigate={navigate} user={user} logout={logout} />;

    default:
      return <LoginPage navigate={navigate} setUser={setUser} />;
  }
}

export default App;
