import sys
print("Script started", file=sys.stderr)
from main import app
print("App imported", file=sys.stderr)
import uvicorn
print("About to run uvicorn", file=sys.stderr)
uvicorn.run(app, host="127.0.0.1", port=8000)
print("Uvicorn finished", file=sys.stderr)
