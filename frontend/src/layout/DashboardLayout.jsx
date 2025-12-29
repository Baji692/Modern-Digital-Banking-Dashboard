// layout/DashboardLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import "../dashboard/DashboardShell.css";

export default function DashboardLayout({ user, logout, children }) {
  return (
    <div className="dash-shell">
      <Sidebar user={user} logout={logout} />
      <main className="dash-content">{children}</main>
    </div>
  );
}
