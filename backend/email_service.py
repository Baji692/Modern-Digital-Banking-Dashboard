import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USERNAME")
SMTP_PASS = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")

if not SMTP_USER or not SMTP_PASS:
    raise RuntimeError("SMTP credentials missing. Check .env file")


def _send(msg):
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


def send_otp_email(to_email: str, otp: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = "FinBank Password Reset OTP"

    body = f"""
Your OTP for resetting password is:

{otp}

This OTP is valid for 5 minutes.
Do not share it with anyone.
"""
    msg.attach(MIMEText(body, "plain"))
    _send(msg)


def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body, "plain")
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    _send(msg)


def send_referral_invite(to_email: str, from_name: str, referral_code: str, frontend_base: str):
    """Send a referral invite with both plain-text and HTML content.

    This is separate from `send_email` to avoid changing existing callers.
    """
    signup_url = f"{frontend_base.rstrip('/')}?ref={referral_code}"

    subject = "You're invited to FinBank — get bonus points"

    text_body = f"Hi,\n\n{from_name} has invited you to try FinBank. Use referral code {referral_code} when signing up to get bonus points.\n\nSign up: {signup_url}\n\nThanks,\nFinBank Team"

    html_body = f"""
<html>
    <body style="font-family:Arial, sans-serif; color:#333;">
        <h2>You're invited to FinBank</h2>
        <p><strong>{from_name}</strong> has invited you to join FinBank.</p>
        <p>Use referral code <strong>{referral_code}</strong> when you sign up to receive bonus points.</p>
        <p><a href="{signup_url}" style="background:#1a73e8;color:#fff;padding:8px 12px;text-decoration:none;border-radius:4px;">Sign up now</a></p>
        <p>Thanks,<br/>FinBank Team</p>
    </body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    _send(msg)


def send_bill_reminder_email(to_email: str, bill_name: str, amount: str, due_date: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = f"Bill Reminder: {bill_name}"

    html = f"""
<html>
<body style="font-family:Arial, sans-serif; color:#333;">
    <h2>Bill Payment Reminder</h2>
    <p><strong>Bill Name:</strong> {bill_name}</p>
    <p><strong>Amount Due:</strong> ₹{amount}</p>
    <p><strong>Due Date:</strong> {due_date}</p>
    <p style="color:red; font-weight:bold;">
        Please pay before the due date to avoid penalties.
    </p>
    <p>Thank you,<br>FinBank Team</p>
</body>
</html>
"""
    msg.attach(MIMEText(html, "html"))
    _send(msg)
