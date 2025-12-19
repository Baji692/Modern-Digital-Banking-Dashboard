// ResetPasswordOtp.js
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify"; // ✅ added
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function ResetPasswordOtp({ navigate }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    inputsRef.current[0] && inputsRef.current[0].focus();
    startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const updateOtpAt = (idx, val) => {
    setOtp((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const onChange = (e, idx) => {
    const val = e.target.value;
    const digit = val.replace(/\D/g, "").slice(-1) || "";

    if (!digit) {
      updateOtpAt(idx, "");
      return;
    }

    updateOtpAt(idx, digit);

    const next = idx + 1;
    if (next < OTP_LENGTH) {
      inputsRef.current[next]?.focus();
    } else {
      inputsRef.current[idx]?.blur();
    }
  };

  const handleInputKeyDown = (e, idx) => {
    const key = e.key;

    if (key === "Enter") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (key === "Backspace") {
      if (otp[idx]) {
        updateOtpAt(idx, "");
      } else {
        const prev = idx - 1;
        if (prev >= 0) {
          updateOtpAt(prev, "");
          inputsRef.current[prev]?.focus();
        }
      }
      return;
    }

    if (key === "ArrowLeft") {
      const prev = idx - 1;
      if (prev >= 0) inputsRef.current[prev]?.focus();
      e.preventDefault();
      return;
    }
    if (key === "ArrowRight") {
      const next = idx + 1;
      if (next < OTP_LENGTH) inputsRef.current[next]?.focus();
      e.preventDefault();
      return;
    }

    if (key.length === 1 && /\D/.test(key)) {
      e.preventDefault();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (digits.length === 0) return;

    setOtp((prev) => {
      const copy = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) {
        copy[i] = digits[i] ?? "";
      }
      return copy;
    });

    const focusIndex =
      digits.length < OTP_LENGTH ? digits.length : OTP_LENGTH - 1;
    setTimeout(() => {
      inputsRef.current[focusIndex]?.focus();
    }, 0);
  };

  const isComplete = otp.every((d) => d !== "");

  const handleSubmit = () => {
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!isComplete) {
      toast.error("Please enter the full 6-digit OTP");
      setError("Please enter the full 6-digit code.");
      return;
    }

    setInfo("Verifying...");

    // 🔁 Replace with real API later
    setTimeout(() => {
      setInfo("");
      toast.success("OTP verified successfully ✅");
      navigate && navigate("resetNewPassword");
    }, 600);
  };

  const sendOtp = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 700);
    });
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;

    setError("");
    setInfo("Resending OTP...");

    const ok = await sendOtp();

    if (ok) {
      toast.success("OTP sent successfully 📧");
      setInfo("OTP sent");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 50);
      startTimer();
      setTimeout(() => setInfo(""), 2000);
    } else {
      toast.error("Failed to resend OTP");
      setError("Failed to resend OTP. Try again.");
    }
  };

  const containerKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", containerKeyDown);
    return () =>
      document.removeEventListener("keydown", containerKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <div className="app-root">
      <div className="top-left-logo" aria-hidden>
        <img src={finBankLogo} alt="FinBank Logo" className="top-logo-img" />
      </div>

      <div className="auth-card-single">
        <section className="signin-pane">
          <div className="signin-logo-circle">
            <img src={bankIcon} alt="Bank Icon" className="signin-logo-icon" />
          </div>

          <h1 className="signin-title">Reset Password</h1>
          <p className="signin-subtitle">
            Enter the OTP received through your email address
          </p>

          <div
            className="otp-row"
            onPaste={onPaste}
            role="group"
            aria-label="Enter verification code"
            style={{ justifyContent: "center" }}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                className="otp-input"
                value={otp[idx]}
                onChange={(e) => onChange(e, idx)}
                onKeyDown={(e) => handleInputKeyDown(e, idx)}
                aria-label={`Digit ${idx + 1}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {info && (
            <div
              className="form-info"
              style={{ textAlign: "center", marginTop: 10 }}
            >
              {info}
            </div>
          )}

          {attemptedSubmit && error && (
            <div
              className="form-error"
              style={{ textAlign: "center", marginTop: 10 }}
            >
              {error}
            </div>
          )}

          <p className="otp-helper" style={{ textAlign: "center", marginTop: 12 }}>
            {!secondsLeft ? (
              <button
                className="link-button"
                onClick={handleResend}
                style={{ padding: 0 }}
              >
                Resend
              </button>
            ) : (
              <>
                Didn't receive code?{" "}
                <span style={{ fontWeight: 600 }}>
                  Resend in {formatTime(secondsLeft)}
                </span>
              </>
            )}
          </p>

          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={!isComplete}
            style={{
              opacity: isComplete ? 1 : 0.6,
              cursor: isComplete ? "pointer" : "not-allowed",
              marginTop: 12,
            }}
          >
            Submit
          </button>

          <div className="signin-footer">
            <button
              className="link-button"
              onClick={() => navigate("resetEmail")}
            >
              Change Email
            </button>
            <button
              className="link-button"
              onClick={() => navigate("login")}
            >
              Back to Login
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
