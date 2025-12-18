🏦 Backend API – Testing Guide (FastAPI + Swagger UI)

This backend is built using FastAPI and exposes REST APIs for users, accounts, transactions, and CSV uploads.
FastAPI automatically provides an interactive API documentation using Swagger UI.

🚀 Running the Backend Server
1️⃣ Navigate to backend folder
cd backend


2️⃣ Create & activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows


3️⃣ Install dependencies
pip install -r requirements.txt


4️⃣ Start FastAPI server
uvicorn main:app --reload


If successful, you will see:
Uvicorn running on http://127.0.0.1:8000


📘 Swagger UI (API Documentation)

Open your browser and go to:

http://127.0.0.1:8000/docs


This opens Swagger UI, where you can:

View all available APIs

Test endpoints interactively

Send requests without writing frontend code

