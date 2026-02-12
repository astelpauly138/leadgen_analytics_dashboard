from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4028","http://192.168.70.102:4028"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
@app.get("/health")
def health_check():
    return {"status": "healthy"}