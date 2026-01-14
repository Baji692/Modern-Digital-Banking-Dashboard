// RegisterOtp.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

const API_BASE = "http://127.0.0.1:9000";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function RegisterOtp({ navigate }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef([]);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const timerRef = useRef(null);

  /* ================= LOAD REGISTRATION DATA ================= */
  const pending = JSON.parse(
    sessionStorage.getItem("pending_register")
  );

  useEffect(() => {
    if (!pending?.email) {
      toast.error("Registration session expired");
      navigate("create");
      return;
    }

    inputsRef.current[0]?.focus();
    startTimer();

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= TIMER ================= */
  const startTimer = () => {
    stopTimer();
    setSecondsLeft(RESEND_SECONDS);

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (secs) => {
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  /* ================= OTP INPUT LOGIC (UNCHANGED) ================= */
  const updateOtpAt = (idx, val) => {
    setOtp((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const onChange = (e, idx) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1) || "";
    if (!digit) {
      updateOtpAt(idx, "");
      return;
    }

    updateOtpAt(idx, digit);

    if (idx + 1 < OTP_LENGTH) {
      inputsRef.current[idx + 1]?.focus();
    } else {
      inputsRef.current[idx]?.blur();
    }
  };

  const handleInputKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) updateOtpAt(idx, "");
      else if (idx > 0) {
        updateOtpAt(idx - 1, "");
        inputsRef.current[idx - 1]?.focus();
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!digits.length) return;

    setOtp((prev) => {
      const copy = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) {
        copy[i] = digits[i] ?? "";
      }
      return copy;
    });

    inputsRef.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  /* ================= VERIFY OTP ================= */
  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!isComplete) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    try {
      const code = otp.join("");

      await axios.post(
        `${API_BASE}/auth/register/verify-otp`,
        {
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          password: pending.password,
          otp: code,
        }
      );

      sessionStorage.removeItem("pending_register");

      toast.success("Account created successfully 🎉");
      navigate("login");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Invalid or expired OTP"
      );
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    if (secondsLeft > 0) return;

    try {
      await axios.post(
        `${API_BASE}/auth/register/send-otp`,
        { email: pending.email }
      );

      toast.success("OTP sent to your email 📧");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      startTimer();
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  /* ================= UI (100% UNCHANGED) ================= */
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
            Enter the OTP received through your email address
          </p>

          <div
            className="otp-row"
            onPaste={onPaste}
            style={{ justifyContent: "center" }}
          >
            {otp.map((v, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                className="otp-input"
                value={v}
                maxLength={1}
                onChange={(e) => onChange(e, idx)}
                onKeyDown={(e) => handleInputKeyDown(e, idx)}
              />
            ))}
          </div>

          {info && <div className="form-info">{info}</div>}
          {attemptedSubmit && error && (
            <div className="form-error">{error}</div>
          )}

          <p className="otp-helper" style={{ textAlign: "center" }}>
            {!secondsLeft ? (
              <button className="link-button" onClick={handleResend}>
                Resend
              </button>
            ) : (
              <>Resend in {formatTime(secondsLeft)}</>
            )}
          </p>

          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={!isComplete}
          >
            Submit
          </button>

          <div className="signin-footer">
            <button className="link-button" onClick={() => navigate("create")}>
              Change Email
            </button>
            <button className="link-button" onClick={() => navigate("login")}>
              Back to Login
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
