import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")


def send_otp_email(to_email: str, otp: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = "FinBank Password Reset OTP"

    body = f"""
    Your OTP for resetting password is:

    {otp}

    This OTP is valid for 5 minutes.
    Do not share it with anyone.
    """

    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_FROM_EMAIL")
    msg["To"] = to_email

    with smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT"))) as server:
        server.starttls()
        server.login(
            os.getenv("SMTP_USERNAME"),
            os.getenv("SMTP_PASSWORD")
        )
        server.send_message(msg)


def send_bill_reminder_email(to_email: str, bill_name: str, amount: str, due_date: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = f"Bill Reminder: {bill_name}"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Bill Payment Reminder</h2>
        <p>Dear User,</p>
        <p>This is a reminder to pay your upcoming bill:</p>
        
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Bill Name:</strong> {bill_name}</p>
            <p><strong>Amount Due:</strong> ₹ {amount}</p>
            <p><strong>Due Date:</strong> {due_date}</p>
        </div>
        
        <p style="color: #d9534f; font-weight: bold;">Please pay as early as possible to avoid any late charges.</p>
        
        <p>Thank you,<br>FinBank Team</p>
    </body>
    </html>
    """

    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
