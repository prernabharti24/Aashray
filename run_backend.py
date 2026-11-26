import os
import sys

# Ensure backend package can be imported regardless of execution directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

import uvicorn

if __name__ == "__main__":
    print("========================================================")
    print("AASHRAY: Mitti Se Mausam Tak")
    print("FastAPI MySQL-Only Physics Simulation Server (SIH26051 DRDO)")
    print("API documentation: http://localhost:8000/docs")
    print("========================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
