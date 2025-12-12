import React from "react";
import "./App.css";
import finBankLogo from "./finbank_logo13-removebg-preview.png";
import bankIcon from "./bank.png";

function ResetPasswordEmail({ navigate }) {
  return (
    <div className="app-root">
          <div className="top-left-logo">
    <img src={finBankLogo} alt="FinBank Logo" className="top-logo-img" />
  </div>
        
      <div className="auth-card-single">
        <section className="signin-pane">
          <div className="signin-logo-circle">
            <img
              src={bankIcon}
              alt="Bank Icon"
              className="signin-logo-icon"
            />
          </div>

          <h1 className="signin-title">Reset Password</h1>
          <p className="signin-subtitle">
            Enter your email to receive a verification code.
          </p>

          <div className="field-group">
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <div className="field-input-wrapper">
              <span className="field-icon">📧</span>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() => navigate("resetOtp")}
          >
            Send Verification Code
          </button>

          <div className="reset-footer">
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

export default ResetPasswordEmail;
