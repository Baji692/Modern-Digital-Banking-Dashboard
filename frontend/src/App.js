import React, { useEffect, useState } from "react";
import "./App.css";
import "./pages/Pages.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";
import Transactions from "./pages/Transactions";

/* ================= AUTH SCREENS ================= */
import RegisterOtp from "./RegisterOtp";
import CreateAccount from "./CreateAccount";
import ResetPasswordEmail from "./ResetPasswordEmail";
import ResetPasswordOtp from "./ResetPasswordOtp";
import ResetPasswordNewPassword from "./ResetPasswordNewPassword";

/* ================= DASHBOARD ================= */
import DashboardLayout from "./layout/DashboardLayout";
import HomeDashboard from "./pages/HomeDashboard";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Bills from "./pages/Bills";
import Rewards from "./pages/Rewards";
import Insights from "./pages/Insights";
import GoalsSettings from "./pages/GoalsSettings";
import UserSettings from "./pages/UserSettings";
import { API_BASE } from "./api";

/* ---------------- EMAIL VALIDATION ---------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   LOGIN PAGE (UI 100% UNCHANGED)
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
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.detail || "Invalid email or password ❌");
        return;
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        kyc_status: data.user.kyc_status,
      };

      /* ✅ SINGLE SOURCE OF TRUTH (FIXED) */
      localStorage.setItem("finbank_user", JSON.stringify(userData));
      localStorage.setItem("finbank_token", data.access_token);

      toast.success(`Welcome back, ${data.user.name}! 🎉`);
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
   MAIN APP (AUTH LOGIC FIXED, UI UNCHANGED)
   ============================================================ */
function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [dashScreen, setDashScreen] = useState("home");

  const navigate = (s) => setScreen(s);

  /* 🔐 AUTO LOGIN (FIXED TOKEN KEY) */
  useEffect(() => {
    const savedUser = localStorage.getItem("finbank_user");
    const token = localStorage.getItem("finbank_token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setScreen("dashboard");
      // Reset to home on page refresh
      setDashScreen("home");
      window.location.hash = "#/home";
    }
  }, []);

  /* 🔄 DASHBOARD NAV */
  useEffect(() => {
    const handler = (e) => setDashScreen(e.detail);
    window.addEventListener("dashboard:navigate", handler);
    return () => window.removeEventListener("dashboard:navigate", handler);
  }, []);

  /* 🔗 HASH ROUTE SUPPORT: update `dashScreen` when URL hash changes */
  useEffect(() => {
    const valid = [
      "home",
      "accounts",
      "transactions",
      "budgets",
      "bills",
      "rewards",
      "insights",
      "goals",
      "settings",
    ];

    const parseHash = () => {
      const h = (window.location.hash || "").replace(/^#\/?/, "");
      // Only navigate to the hash route if user is already logged in
      if (valid.includes(h) && localStorage.getItem("finbank_token")) {
        setDashScreen(h);
        setScreen("dashboard");
        // notify other parts (Sidebar) about the navigation
        window.dispatchEvent(
          new CustomEvent("dashboard:navigate", { detail: h })
        );
      } else if (h === "") {
        // If no hash, default to home when logged in
        if (localStorage.getItem("finbank_token")) {
          setDashScreen("home");
          setScreen("dashboard");
        }
      }
    };

    // handle initial load and subsequent hash changes
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, []);

  /* 🔒 RESET FLOW GUARD */
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
    setDashScreen("home");
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("finbank_user");
    localStorage.removeItem("finbank_token");
    sessionStorage.clear();
    setUser(null);
    setScreen("login");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {screen === "login" && (
        <LoginPage onLogin={handleLogin} navigate={navigate} />
      )}
      {screen === "create" && <CreateAccount navigate={navigate} />}
      {screen === "registerOtp" && <RegisterOtp navigate={navigate} />}
      {screen === "resetEmail" && <ResetPasswordEmail navigate={navigate} />}
      {screen === "resetOtp" && <ResetPasswordOtp navigate={navigate} />}
      {screen === "resetNewPassword" && (
        <ResetPasswordNewPassword navigate={navigate} />
      )}

      {screen === "dashboard" && (
        <DashboardLayout user={user} logout={handleLogout}>
          {dashScreen === "home" && <HomeDashboard user={user} />}
          {dashScreen === "accounts" && <Accounts />}
          {dashScreen === "budgets" && <Budgets />}
          {dashScreen === "bills" && <Bills />}
          {dashScreen === "transactions" && <Transactions />}
          {dashScreen === "rewards" && <Rewards />}
          {dashScreen === "insights" && <Insights />}
          {dashScreen === "goals" && <GoalsSettings />}
          {dashScreen === "settings" && <UserSettings navigate={navigate} />}
        </DashboardLayout>
      )}

    </>
  );
}

export default App;
