// App.js
import React, { useEffect, useState } from "react";
import "./App.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

// Screens
import RegisterOtp from "./RegisterOtp";
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
   LOGIN PAGE (UI PRESERVED 100%)
   ============================================================ */
function LoginPage({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
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

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Invalid email or password ❌");
        return;
      }

      const userData = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        kyc_status: data.kyc_status,
      };

      localStorage.setItem("finbank_user", JSON.stringify(userData));
      toast.success(`Welcome back, ${data.name}! 🎉`);

      onLogin(userData);
    } catch {
      toast.error("Server not reachable 🚫");
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
              />
            </div>
            {emailError && <div className="form-error">{emailError}</div>}
          </div>

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
            <button
              className="link-button"
              onClick={() => navigate("resetEmail")}
            >
              Forgot password?
            </button>
          </div>

          <button
            className="primary-button"
            onClick={handleSignIn}
            disabled={loading}
          >
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

  const navigate = (s) => setScreen(s);

  /* 🔐 Auto-login if already authenticated */
  useEffect(() => {
    const saved = localStorage.getItem("finbank_user");
    if (saved) {
      setUser(JSON.parse(saved));
      setScreen("dashboard");
    }
  }, []);

  /* ✅ PASSWORD RESET SESSION GUARD (FIXES YOUR BUG) */
  useEffect(() => {
    if (screen === "resetOtp" || screen === "resetNewPassword") {
      const resetEmail = sessionStorage.getItem("reset_email");
      if (!resetEmail) {
        toast.error("Password reset session expired");
        setScreen("resetEmail");
      }
    }
  }, [screen]);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("finbank_user");
    sessionStorage.removeItem("pending_register");
    sessionStorage.removeItem("reset_email");
    setUser(null);
    setScreen("login");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {(() => {
        switch (screen) {
          case "login":
            return <LoginPage onLogin={handleLogin} navigate={navigate} />;
          case "create":
            return <CreateAccount navigate={navigate} />;
          case "registerOtp":
            return <RegisterOtp navigate={navigate} />;
          case "resetEmail":
            return <ResetPasswordEmail navigate={navigate} />;
          case "resetOtp":
            return <ResetPasswordOtp navigate={navigate} />;
          case "resetNewPassword":
            return <ResetPasswordNewPassword navigate={navigate} />;
          case "dashboard":
            return (
              <Dashboard
                navigate={navigate}
                user={user}
                logout={handleLogout}
              />
            );
          default:
            return <LoginPage onLogin={handleLogin} navigate={navigate} />;
        }
      })()}
    </>
  );
}

export default App;
