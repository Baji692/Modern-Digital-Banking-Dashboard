import React from "react";
import "./Modal.css";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="link-button" onClick={onClose}>✖</button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
