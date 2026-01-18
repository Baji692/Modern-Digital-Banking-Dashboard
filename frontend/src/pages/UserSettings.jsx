import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { apiFetch } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";

/* ================= HELP MODAL COMPONENT ================= */
const HelpModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const content = {
        privacy: {
            title: "Privacy Policy",
            sections: [
                {
                    heading: "Information We Collect",
                    text: "FinBank collects personal information including your name, email address, phone number, and banking details to provide financial services. We also collect transaction data, account information, and usage patterns to improve our services."
                },
                {
                    heading: "How We Use Your Information",
                    text: "Your information is used to: (1) Process financial transactions, (2) Maintain account security, (3) Comply with regulatory requirements, (4) Provide customer support, (5) Improve our products and services, (6) Send important notifications and updates about your account."
                },
                {
                    heading: "Data Security",
                    text: "FinBank employs industry-standard encryption, secure servers, and multi-factor authentication to protect your data. We maintain strict access controls and conduct regular security audits to ensure your information remains confidential and secure."
                },
                {
                    heading: "Third-Party Sharing",
                    text: "We do not sell your personal information. We may share data with trusted service providers, regulatory authorities, and financial institutions only as necessary to provide services or comply with legal obligations."
                },
                {
                    heading: "Your Rights",
                    text: "You have the right to access, modify, or delete your personal information. You can manage your privacy settings and communication preferences in your account settings at any time."
                }
            ]
        },
        terms: {
            title: "Terms & Conditions",
            sections: [
                {
                    heading: "Account Eligibility",
                    text: "To open and maintain a FinBank account, you must be at least 18 years old, be a legal resident, and provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials."
                },
                {
                    heading: "Acceptable Use",
                    text: "You agree to use FinBank services only for lawful purposes. Prohibited activities include: fraud, money laundering, unauthorized access, and violations of any applicable laws or regulations. FinBank reserves the right to suspend or terminate accounts that violate these terms."
                },
                {
                    heading: "Transaction Limits",
                    text: "FinBank enforces daily transaction limits to protect account security. Standard limits are: Daily transfers: ₹500,000, Daily transaction count: 50, Peer-to-peer transfers: ₹100,000. Limits can be increased upon request after identity verification."
                },
                {
                    heading: "Liability & Disputes",
                    text: "FinBank is not liable for unauthorized transactions if you fail to report suspicious activity within 30 days. For disputed transactions, contact our support team within 90 days of the transaction date for investigation and resolution."
                },
                {
                    heading: "Service Modifications",
                    text: "FinBank reserves the right to modify, suspend, or discontinue services with 30 days' notice. We may update these terms at any time. Continued use of our services constitutes acceptance of updated terms."
                }
            ]
        },
        faq: {
            title: "Frequently Asked Questions",
            sections: [
                {
                    heading: "How do I reset my password?",
                    text: "Click on the 'Reset Password' button in your Settings. You'll receive an OTP via email, which you'll use to create a new password. Make sure to use a strong, unique password."
                },
                {
                    heading: "What are the transaction fees?",
                    text: "Basic account transfers are free. International transfers incur a 1.5% fee with a minimum of ₹50. Bill payments and peer-to-peer transfers are free for all users."
                },
                {
                    heading: "How long do transfers take?",
                    text: "Domestic transfers within FinBank are instant. Inter-bank transfers typically take 1-2 hours during business hours and up to 24 hours outside business hours. International transfers can take 2-5 business days."
                },
                {
                    heading: "Is my account secure?",
                    text: "Yes, FinBank uses 256-bit SSL encryption, multi-factor authentication, and regular security audits. All transactions are monitored for fraudulent activity, and your data is protected by industry standards."
                },
                {
                    heading: "How do I report suspicious activity?",
                    text: "Contact FinBank support immediately at support@finbank.com or call +1 (800) 555-0123. Report any unauthorized transactions within 30 days for full protection under our fraud liability policy."
                },
                {
                    heading: "Can I export my transaction history?",
                    text: "Yes, you can export your transactions, insights, and account data in CSV or PDF format from the Settings page. You have complete access to your financial data for records and tax purposes."
                }
            ]
        },
        documentation: {
            title: "Documentation & User Guide",
            sections: [
                {
                    heading: "Getting Started",
                    text: "Welcome to FinBank! To begin, complete your KYC (Know Your Customer) verification, set up your security preferences, and link your primary bank account. You'll have immediate access to all basic features."
                },
                {
                    heading: "Dashboard Overview",
                    text: "Your dashboard displays real-time account balances, recent transactions, budget status, and financial insights. Use the sidebar navigation to access Accounts, Transactions, Budgets, Bills, Rewards, Insights, and Goals."
                },
                {
                    heading: "Managing Transactions",
                    text: "View all transactions with filters by date, amount, and category. Export transaction history for accounting purposes. Enable transaction alerts in Settings to get real-time notifications for every transaction."
                },
                {
                    heading: "Budget & Spending",
                    text: "Set monthly budgets for different categories. Track spending in real-time and receive alerts when approaching limits. View spending analytics and get personalized recommendations to optimize your finances."
                },
                {
                    heading: "Financial Goals",
                    text: "Create custom savings and spending goals. Track progress with visual indicators. Set goal amounts, deadlines, and categories. Get reminders and celebrate milestones as you achieve your financial objectives."
                },
                {
                    heading: "Support & Settings",
                    text: "Customize notification preferences for email, SMS, and in-app alerts. Manage security settings including two-factor authentication and password changes. Export your data anytime in CSV or PDF format."
                }
            ]
        }
    };

    const data = content[type] || { title: "Help", sections: [] };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-modal-header">
                    <h2>{data.title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="help-modal-content">
                    {data.sections.map((section, idx) => (
                        <div key={idx} className="help-section-item">
                            <h3>{section.heading}</h3>
                            <p>{section.text}</p>
                        </div>
                    ))}
                </div>

                <div className="help-modal-footer">
                    <button className="help-modal-close-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= EXPORT MODAL COMPONENT ================= */
const ExportModal = ({ isOpen, onClose, onExport, dataType, step, onSelectType }) => {
    if (!isOpen) return null;

    const typeLabels = {
        profile: "Profile Data",
        transactions: "Transactions",
        accounts: "Accounts Data",
        insights: "Financial Insights",
        notifications: "Notification Preferences",
        all: "Export All Data",
    };

    const typeDescriptions = {
        profile: "Your account profile information",
        transactions: "Complete transaction history",
        accounts: "All account details",
        insights: "Financial analysis and insights",
        notifications: "Notification preferences",
        all: "All profile, transaction, account and insights data",
    };

    if (step === "type") {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="export-modal-header">
                        <h3>Select Export Type</h3>
                        <button className="modal-close-btn" onClick={onClose}>×</button>
                    </div>

                    <div className="export-modal-content">
                        <p className="export-description">
                            Choose what data you would like to export
                        </p>

                        <div className="export-type-options">
                            {["profile", "transactions", "accounts", "insights", "all"].map((type) => (
                                <button
                                    key={type}
                                    className="export-type-btn"
                                    onClick={() => onSelectType(type)}
                                >
                                    <div className="type-icon">📄</div>
                                    <div className="type-name">{typeLabels[type]}</div>
                                    <div className="type-desc">{typeDescriptions[type]}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="export-modal-footer">
                        <button className="modal-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Format selection step
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal-header">
                    <h3>Select Format - {typeLabels[dataType]}</h3>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="export-modal-content">
                    <p className="export-description">
                        Choose your preferred format to download {typeLabels[dataType].toLowerCase()}
                    </p>

                    <div className="export-options">
                        <button
                            className="export-format-btn csv-btn"
                            onClick={() => {
                                onExport("csv");
                                onClose();
                            }}
                        >
                            <div className="format-icon">📄</div>
                            <div className="format-name">CSV Format</div>
                            <div className="format-desc">Spreadsheet compatible</div>
                        </button>

                        <button
                            className="export-format-btn pdf-btn"
                            onClick={() => {
                                onExport("pdf");
                                onClose();
                            }}
                        >
                            <div className="format-icon">📕</div>
                            <div className="format-name">PDF Format</div>
                            <div className="format-desc">Professional document</div>
                        </button>
                    </div>
                </div>

                <div className="export-modal-footer">
                    <button className="modal-cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function UserSettings({ navigate }) {
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showEmailOtpVerification, setShowEmailOtpVerification] = useState(false);
    const [emailOtp, setEmailOtp] = useState("");
    const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true,
        transactionAlerts: true,
        budgetAlerts: true,
        billReminders: true,
        rewardsUpdates: true,
        insightsAnalytics: true,
    });
    const [exportModal, setExportModal] = useState({
        isOpen: false,
        type: null,
        step: "type",
    });
    const [helpModal, setHelpModal] = useState({
        isOpen: false,
        type: null,
    });
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [insights, setInsights] = useState(null);

    /* ================= LOAD USER DATA ================= */
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("finbank_user"));
        if (savedUser) {
            setUser(savedUser);
            setEditForm({
                name: savedUser.name || "",
                email: savedUser.email || "",
            });
            loadUserDetails(savedUser.id);
            loadTransactions();
            loadAccounts();
            loadInsights();
        }

        // Load notification preferences from localStorage
        const savedPreferences = localStorage.getItem("finbank_notifications");
        if (savedPreferences) {
            setNotificationPreferences(JSON.parse(savedPreferences));
        }

        setLoading(false);
    }, []);

    const loadUserDetails = async (userId) => {
        try {
            const data = await apiFetch("get", `/auth/user/${userId}`);
            if (data) {
                setUserDetails(data);
            }
        } catch (err) {
            console.error("Error loading user details:", err);
        }
    };

    const loadTransactions = async () => {
        try {
            const data = await apiFetch("get", "/transactions/");
            if (data) {
                setTransactions(data);
            }
        } catch (err) {
            console.error("Error loading transactions:", err);
        }
    };

    const loadAccounts = async () => {
        try {
            const data = await apiFetch("get", "/accounts/");
            if (data) {
                setAccounts(data);
            }
        } catch (err) {
            console.error("Error loading accounts:", err);
        }
    };

    const maskAccountNumber = (accountNumber) => {
        if (!accountNumber) return "N/A";
        const num = accountNumber.toString();
        if (num.length <= 4) return num;
        return "*".repeat(num.length - 4) + num.slice(-4);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" });
        } catch (e) {
            return dateString;
        }
    };

    const loadInsights = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem("finbank_user"))?.id;
            if (userId) {
                const data = await apiFetch("get", `/insights/analytics/${userId}`);
                if (data) {
                    setInsights(data);
                }
            }
        } catch (err) {
            console.error("Error loading insights:", err);
        }
    };

    /* ================= UPDATE PROFILE ================= */
    const handleUpdateProfile = async () => {
        if (!editForm.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setUpdatingProfile(true);
        try {
            // Check if email has changed
            const emailChanged = editForm.email.trim() !== user.email;

            if (emailChanged) {
                // Email changed - need OTP verification
                // First, send OTP to new email
                const otpResponse = await apiFetch("post", "/auth/send-email-otp", {
                    email: editForm.email.trim(),
                });

                if (otpResponse) {
                    // Store temporary email for OTP verification
                    sessionStorage.setItem(
                        "email_change_data",
                        JSON.stringify({
                            user_id: user.id,
                            new_email: editForm.email.trim(),
                            name: editForm.name.trim(),
                        })
                    );
                    setIsEditing(false);
                    // Show OTP verification modal/component
                    setShowEmailOtpVerification(true);
                    toast.info("OTP sent to your new email address");
                }
            } else {
                // Only name changed - direct update
                const payload = {
                    name: editForm.name.trim(),
                };

                const response = await apiFetch("put", `/auth/user/${user.id}`, payload);

                if (response) {
                    const updatedUser = {
                        ...user,
                        name: editForm.name.trim(),
                    };
                    localStorage.setItem("finbank_user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setIsEditing(false);
                    toast.success("Profile updated successfully!");
                }
            }
        } catch (err) {
            toast.error("Failed to update profile: " + err.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    /* ================= HANDLE EMAIL OTP VERIFICATION ================= */
    const handleVerifyEmailOtp = async () => {
        if (!emailOtp.trim()) {
            toast.error("Please enter the OTP");
            return;
        }

        if (emailOtp.length !== 6) {
            toast.error("OTP must be 6 digits");
            return;
        }

        setVerifyingEmailOtp(true);
        try {
            const emailChangeData = JSON.parse(sessionStorage.getItem("email_change_data"));

            if (!emailChangeData) {
                toast.error("Email change data expired. Please try again.");
                setShowEmailOtpVerification(false);
                setVerifyingEmailOtp(false);
                return;
            }

            const response = await apiFetch("post", "/auth/verify-email-otp", {
                user_id: emailChangeData.user_id,
                new_email: emailChangeData.new_email,
                name: emailChangeData.name,
                otp: emailOtp.trim(),
            });

            if (response && response.success) {
                toast.success("Email verified successfully! Redirecting to login...");
                sessionStorage.removeItem("email_change_data");
                setEmailOtp("");
                setShowEmailOtpVerification(false);
                // Clear all user data and redirect to login
                localStorage.removeItem("finbank_user");
                localStorage.removeItem("finbank_token");

                // Use setTimeout to ensure toast is shown before redirect
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || "Verification failed";
            toast.error(errorMessage);
        } finally {
            setVerifyingEmailOtp(false);
        }
    };

    /* ================= HANDLE NOTIFICATION TOGGLE ================= */
    const handleNotificationToggle = (key) => {
        const newPreferences = {
            ...notificationPreferences,
            [key]: !notificationPreferences[key],
        };
        setNotificationPreferences(newPreferences);
        localStorage.setItem("finbank_notifications", JSON.stringify(newPreferences));

        const names = {
            emailNotifications: "Email Notifications",
            transactionAlerts: "Transaction Alerts",
            budgetAlerts: "Budget Alerts",
            billReminders: "Bill Reminders",
            rewardsUpdates: "Rewards Updates",
            insightsAnalytics: "Insights & Analytics",
        };

        const status = newPreferences[key] ? "enabled" : "disabled";
        toast.info(`${names[key]} ${status}`);
    };

    /* ================= RESET PASSWORD ================= */
    const handleResetPassword = () => {
        sessionStorage.setItem("reset_from_settings", "true");
        navigate("resetEmail");
    };

    /* ================= EXPORT MODAL HANDLERS ================= */
    const openExportModal = (type) => {
        setExportModal({ isOpen: true, type });
    };

    const closeExportModal = () => {
        setExportModal({ isOpen: false, type: null, step: "type" });
    };

    const selectExportType = (type) => {
        setExportModal({ isOpen: true, type: type, step: "format" });
    };

    const handleExportConfirm = (format) => {
        handleExport(exportModal.type, format);
    };

    /* ================= HELP MODAL HANDLERS ================= */
    const openHelpModal = (type) => {
        setHelpModal({ isOpen: true, type });
    };

    const closeHelpModal = () => {
        setHelpModal({ isOpen: false, type: null });
    };

    /* ================= EXPORT FUNCTIONALITY ================= */
    const handleExport = async (type, format) => {
        try {
            let data = [];
            let filename = "";

            if (type === "profile") {
                data = [
                    ["Profile Information"],
                    ["Name", user.name],
                    ["Email", user.email],
                    ["KYC Status", userDetails?.kyc_status || "N/A"],
                    ["Account Status", "Active"],
                    ["Member Since", new Date().toLocaleDateString()],
                    ["Account Type", "Premium Banking"],
                ];
                filename = `finbank_profile_${new Date().getTime()}`;
            } else if (type === "accounts") {
                data = [
                    ["Accounts Information"],
                    ["Bank Name", "Account Type", "Account Number", "Balance", "Status"],
                ];
                if (accounts && accounts.length > 0) {
                    accounts.forEach((acc) => {
                        data.push([
                            acc.bank_name || "N/A",
                            acc.account_type || "N/A",
                            maskAccountNumber(acc.masked_account),
                            acc.balance || "₹0",
                            acc.is_primary ? "Primary" : "Active",
                        ]);
                    });
                } else {
                    data.push(["No accounts found", "", "", "", ""]);
                }
                filename = `finbank_accounts_${new Date().getTime()}`;
            } else if (type === "transactions") {
                data = [
                    ["Transaction History"],
                    ["Transaction Date", "Description", "Amount", "Type", "Category", "Status"],
                ];
                transactions.forEach((txn) => {
                    data.push([
                        formatDate(txn.date || txn.txn_date),
                        txn.description || "N/A",
                        txn.amount,
                        txn.txn_type,
                        txn.category || "N/A",
                        txn.status || "N/A",
                    ]);
                });
                filename = `finbank_transactions_${new Date().getTime()}`;
            } else if (type === "insights") {
                data = [
                    ["Financial Insights Summary"],
                    ["Metric", "Value"],
                ];
                if (insights) {
                    data.push(["Total Spending", insights.total_spending || 0]);
                    data.push(["Transaction Count", insights.transaction_count || 0]);
                    data.push(["This Week Spending", insights.this_week_spending || 0]);
                    data.push(["Total Bills", insights.total_bills || 0]);
                    data.push(["Bills Paid", insights.paid_bills || 0]);
                    data.push(["Bills Paid Amount", insights.bills_paid_amount || 0]);
                    data.push(["Total Bills Amount", insights.total_bills_amount || 0]);
                    data.push(["Savings Rate", (insights.savings_rate || 0).toFixed(2) + "%"]);
                    if (insights.category_data && Object.keys(insights.category_data).length > 0) {
                        data.push([]);
                        data.push(["Category Breakdown"]);
                        Object.entries(insights.category_data).forEach(([category, amount]) => {
                            data.push([category, amount]);
                        });
                    }
                    if (insights.merchant_data && Object.keys(insights.merchant_data).length > 0) {
                        data.push([]);
                        data.push(["Merchant Breakdown"]);
                        Object.entries(insights.merchant_data).forEach(([merchant, amount]) => {
                            data.push([merchant, amount]);
                        });
                    }
                    if (insights.monthly_trend && insights.monthly_trend.length > 0) {
                        data.push([]);
                        data.push(["Monthly Trend"]);
                        insights.monthly_trend.forEach(([month, amount]) => {
                            data.push([month, amount]);
                        });
                    }
                }
                filename = `finbank_insights_${new Date().getTime()}`;
            } else if (type === "all") {
                // Export all data
                data = [
                    ["FINBANK - COMPLETE ACCOUNT EXPORT"],
                    [],
                    ["PROFILE INFORMATION"],
                    ["Name", user.name],
                    ["Email", user.email],
                    ["KYC Status", userDetails?.kyc_status || "N/A"],
                    ["Account Status", "Active"],
                    [],
                    ["ACCOUNTS"],
                    ["Bank Name", "Account Type", "Account Number", "Balance", "Status"],
                ];
                if (accounts && accounts.length > 0) {
                    accounts.forEach((acc) => {
                        data.push([
                            acc.bank_name || "N/A",
                            acc.account_type || "N/A",
                            maskAccountNumber(acc.masked_account),
                            acc.balance || "₹0",
                            acc.is_primary ? "Primary" : "Active",
                        ]);
                    });
                }
                data.push(
                    [],
                    ["TRANSACTION HISTORY"],
                    ["Transaction Date", "Description", "Amount", "Type", "Category", "Status"],
                );
                transactions.forEach((txn) => {
                    data.push([
                        formatDate(txn.date || txn.txn_date),
                        txn.description || "N/A",
                        txn.amount,
                        txn.txn_type,
                        txn.category || "N/A",
                        txn.status || "N/A",
                    ]);
                });
                data.push([]);
                data.push(["FINANCIAL INSIGHTS"]);
                data.push(["Metric", "Value"]);
                if (insights) {
                    data.push(["Total Spending", insights.total_spending || 0]);
                    data.push(["Transaction Count", insights.transaction_count || 0]);
                    data.push(["This Week Spending", insights.this_week_spending || 0]);
                    data.push(["Total Bills", insights.total_bills || 0]);
                    data.push(["Bills Paid", insights.paid_bills || 0]);
                    data.push(["Bills Paid Amount", insights.bills_paid_amount || 0]);
                    data.push(["Total Bills Amount", insights.total_bills_amount || 0]);
                    data.push(["Savings Rate", (insights.savings_rate || 0).toFixed(2) + "%"]);
                    if (insights.category_data && Object.keys(insights.category_data).length > 0) {
                        data.push([]);
                        data.push(["Category Breakdown"]);
                        Object.entries(insights.category_data).forEach(([category, amount]) => {
                            data.push([category, amount]);
                        });
                    }
                    if (insights.merchant_data && Object.keys(insights.merchant_data).length > 0) {
                        data.push([]);
                        data.push(["Merchant Breakdown"]);
                        Object.entries(insights.merchant_data).forEach(([merchant, amount]) => {
                            data.push([merchant, amount]);
                        });
                    }
                    if (insights.monthly_trend && insights.monthly_trend.length > 0) {
                        data.push([]);
                        data.push(["Monthly Trend"]);
                        insights.monthly_trend.forEach(([month, amount]) => {
                            data.push([month, amount]);
                        });
                    }
                }
                filename = `finbank_complete_export_${new Date().getTime()}`;
            }

            if (format === "csv") {
                exportAsCSV(data, filename);
            } else {
                exportAsPDF(data, filename);
            }

            toast.success(`✅ Exported as ${format.toUpperCase()} successfully!`);
        } catch (err) {
            toast.error("Export failed: " + err.message);
        }
    };

    /* ================= OPEN HELP MODAL ================= */

    const exportAsCSV = (data, filename) => {
        const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportAsPDF = (data, filename) => {
        // Generate HTML content for PDF
        let htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333;">
            <div style="border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="margin: 0 0 10px 0; color: #003366; font-size: 28px;">FinBank - Account Export Document</h1>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">Generated: ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">Export ID: ${filename}</p>
            </div>`;

        let currentSection = null;
        let tableRows = [];

        data.forEach((row, index) => {
            if (index === 0 || (row.length === 1 && index > 0)) {
                // Close previous section
                if (tableRows.length > 0) {
                    htmlContent += `<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        ${tableRows.map((tr, i) => `<${i === 0 ? 'thead' : 'tbody'}><tr>${tr}</tr></${i === 0 ? 'thead' : 'tbody'}>`).join('')}
                    </table>`;
                    tableRows = [];
                }

                if (currentSection !== row[0]) {
                    if (currentSection !== null) {
                        htmlContent += `</div>`;
                    }
                    currentSection = row[0];
                    htmlContent += `<div style="margin: 20px 0; page-break-inside: avoid;">
                        <h2 style="font-size: 16px; font-weight: bold; color: #003366; border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 10px; margin-top: 0;">${currentSection}</h2>`;
                }
            } else {
                if (row.length > 1) {
                    const isHeader = tableRows.length === 0;
                    const cells = row.map(cell =>
                        `<${isHeader ? 'th' : 'td'} style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; ${isHeader ? 'background-color: #f0f0f0; font-weight: bold;' : ''}">${cell}</${isHeader ? 'th' : 'td'}>`
                    ).join('');
                    tableRows.push(cells);
                }
            }
        });

        // Close last table and section
        if (tableRows.length > 0) {
            htmlContent += `<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                ${tableRows.map((tr, i) => `<${i === 0 ? 'thead' : 'tbody'}><tr>${tr}</tr></${i === 0 ? 'thead' : 'tbody'}>`).join('')}
            </table>`;
        }
        if (currentSection !== null) {
            htmlContent += `</div>`;
        }

        htmlContent += `
            <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 11px; color: #666; text-align: center;">
                <p style="margin: 0;">This document is generated by FinBank Account System</p>
                <p style="margin: 5px 0 0 0;">For security, store this document safely. Do not share sensitive financial information.</p>
            </div>
        </div>`;

        // Create a temporary container for HTML2PDF
        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        const opt = {
            margin: 10,
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();

        toast.success("PDF exported successfully!");
    };

    if (loading) {
        return <LoadingOverlay message="Loading settings..." />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>
                <button
                    className="action-btn"
                    onClick={() => setExportModal({ isOpen: true, type: null, step: "type" })}
                    title="Export your data"
                >
                    Export Data
                </button>
            </div>

            {/* ================= EXPORT MODALS ================= */}
            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={closeExportModal}
                onExport={handleExportConfirm}
                dataType={exportModal.type}
                step={exportModal.step}
                onSelectType={selectExportType}
            />

            <HelpModal
                isOpen={helpModal.isOpen}
                onClose={closeHelpModal}
                type={helpModal.type}
            />

            {/* ================= USER PROFILE CARD ================= */}
            <div className="settings-section">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-title">Profile Information</h2>
                        {!isEditing && (
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                                title="Edit profile"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="settings-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, name: e.target.value })
                                    }
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, email: e.target.value })
                                    }
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    className="primary-button"
                                    onClick={handleUpdateProfile}
                                    disabled={updatingProfile}
                                >
                                    {updatingProfile ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    className="secondary-button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditForm({
                                            name: user.name || "",
                                            email: user.email || "",
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-display">
                            <div className="profile-item">
                                <span className="profile-label">Full Name</span>
                                <span className="profile-value">{user?.name || "N/A"}</span>
                            </div>

                            <div className="profile-item">
                                <span className="profile-label">Email Address</span>
                                <span className="profile-value">{user?.email || "N/A"}</span>
                            </div>

                            {userDetails?.kyc_status && (
                                <div className="profile-item">
                                    <span className="profile-label">KYC Status</span>
                                    <span
                                        className={`profile-value status-${userDetails.kyc_status.toLowerCase()}`}
                                    >
                                        {userDetails.kyc_status}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= SECURITY SECTION ================= */}
            <div className="settings-section">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-title">Security</h2>
                    </div>

                    <div className="security-section">
                        <div className="security-item">
                            <div className="security-info">
                                <h3>Password Management</h3>
                                <p>Change or reset your account password to keep your account secure</p>
                            </div>
                            <button
                                className="danger-button"
                                onClick={handleResetPassword}
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= NOTIFICATION PREFERENCES ================= */}
            <div className="settings-section">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-title">Notification Preferences</h2>
                    </div>

                    <div className="notifications-grid">
                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Email Notifications</span>
                            </div>
                            <p className="notification-desc">Receive updates via email</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.emailNotifications}
                                    onChange={() => handleNotificationToggle('emailNotifications')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Transaction Alerts</span>
                            </div>
                            <p className="notification-desc">Get notified about every transaction</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.transactionAlerts}
                                    onChange={() => handleNotificationToggle('transactionAlerts')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Budget Alerts</span>
                            </div>
                            <p className="notification-desc">Alert when approaching budget limits</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.budgetAlerts}
                                    onChange={() => handleNotificationToggle('budgetAlerts')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Bill Reminders</span>
                            </div>
                            <p className="notification-desc">Get notified before bills are due</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.billReminders}
                                    onChange={() => handleNotificationToggle('billReminders')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Rewards Updates</span>
                            </div>
                            <p className="notification-desc">Get notified about new rewards</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.rewardsUpdates}
                                    onChange={() => handleNotificationToggle('rewardsUpdates')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-header">
                                <span>Insights & Analytics</span>
                            </div>
                            <p className="notification-desc">Weekly financial insights and tips</p>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.insightsAnalytics}
                                    onChange={() => handleNotificationToggle('insightsAnalytics')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="settings-export-buttons">
                        <button
                            className="export-btn"
                            onClick={() => openExportModal("notifications")}
                            title="Export notification preferences"
                        >
                            Export Preferences
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= ACCOUNT INFORMATION ================= */}
            <div className="settings-section">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-title">Account Information</h2>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Account Status</span>
                            <span className="info-value status-active">Active</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Member Since</span>
                            <span className="info-value">
                                {new Date().toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Account Type</span>
                            <span className="info-value">Premium Banking</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Linked Accounts</span>
                            <span className="info-value">Multiple</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= HELP & SUPPORT ================= */}
            <div className="settings-section settings-section-last">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-title">Help & Support</h2>
                    </div>

                    <div className="help-section">
                        <div className="help-category">
                            <h3>Documentation</h3>
                            <div className="help-links">
                                <button className="help-link" onClick={() => openHelpModal("documentation")}>
                                    View Documentation
                                </button>
                                <button className="help-link" onClick={() => openHelpModal("faq")}>
                                    FAQ
                                </button>
                            </div>
                        </div>

                        <div className="help-category">
                            <h3>Legal</h3>
                            <div className="help-links">
                                <button className="help-link" onClick={() => openHelpModal("privacy")}>
                                    Privacy Policy
                                </button>
                                <button className="help-link" onClick={() => openHelpModal("terms")}>
                                    Terms & Conditions
                                </button>
                            </div>
                        </div>

                        <div className="help-category">
                            <h3>Contact Us</h3>
                            <div className="contact-info">
                                <p><strong>FinBank Customer Support</strong></p>
                                <p>Email: support@finbank.com</p>
                                <p>Phone: +1 (800) 555-0123</p>
                                <p>Hours: Monday - Friday, 9 AM - 6 PM EST</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= EMAIL OTP VERIFICATION MODAL ================= */}
            {showEmailOtpVerification && (
                <div className="modal-overlay" onClick={() => !verifyingEmailOtp && setShowEmailOtpVerification(false)}>
                    <div className="otp-verification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="otp-modal-header">
                            <h2>Verify Your New Email</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowEmailOtpVerification(false)}
                                disabled={verifyingEmailOtp}
                            >
                                ×
                            </button>
                        </div>

                        <div className="otp-modal-content">
                            <p className="otp-message">
                                We've sent a verification code to your new email address. Please enter it below to confirm your email change.
                            </p>

                            <div className="form-group">
                                <label className="form-label">Verification Code</label>
                                <input
                                    type="text"
                                    className="form-input otp-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    maxLength="6"
                                    disabled={verifyingEmailOtp}
                                />
                            </div>

                            <button
                                className="primary-button otp-verify-btn"
                                onClick={handleVerifyEmailOtp}
                                disabled={verifyingEmailOtp || emailOtp.length !== 6}
                            >
                                {verifyingEmailOtp ? "Verifying..." : "Verify Email"}
                            </button>

                            <p className="otp-footer-text">
                                Didn't receive the code? Check your spam folder or try again.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
