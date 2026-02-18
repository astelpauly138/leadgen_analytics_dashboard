from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router
from routes.campaign_kpi import router as campaign_router
from routes.leads_analytics import router as lead_router
from routes.create_campaign import router as campaign_create_router
from routes.lead_scraping import router as lead_scraping_router
from routes.leads_approved import router as leads_approved_router

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
app.include_router(campaign_router)
app.include_router(lead_router)
app.include_router(campaign_create_router)
app.include_router(lead_scraping_router)
app.include_router(leads_approved_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}