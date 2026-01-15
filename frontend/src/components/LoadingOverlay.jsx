import React from "react";
import "./LoadingOverlay.css";

export default function LoadingOverlay({ text = "Loading..." }) {
    return (
        <div className="loading-backdrop">
            <div className="loading-card">
                <div className="spinner" aria-hidden="true"></div>
                <div className="loading-text">{text}</div>
            </div>
        </div>
    );
}
