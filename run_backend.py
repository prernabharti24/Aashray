import uvicorn

if __name__ == "__main__":
    print("========================================================")
    print("AASHRAY: Mitti Se Mausam Tak")
    print("FastAPI Transient Physics Simulation Server (SIH26051 DRDO)")
    print("API documentation: http://localhost:8000/docs")
    print("========================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
