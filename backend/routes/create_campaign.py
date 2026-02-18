from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from supabase_client import supabase
from routes.activity_log import insert_activity_log
from datetime import datetime
import uuid

router = APIRouter()


# Request model for campaign creation
class CampaignCreate(BaseModel):
    name: str
    campaign_type: str
    industry: str
    area: str
    city: str
    state: str
    country: str
    job_titles: List[str]
    requested_leads: int
    status: str

@router.post("/campaigns/{user_id}")
def create_campaign(user_id: str, payload: CampaignCreate):
    try:

        # 1️⃣ Prepare campaign data from user
        campaign_data = payload.dict()
        campaign_data["user_id"] = user_id
        campaign_data["created_at"] = datetime.utcnow().isoformat()

        # 2️⃣ Insert into campaigns table
        result = supabase.table("campaigns").insert(campaign_data).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to insert campaign")

        inserted_campaign = result.data[0]

        # 3️⃣ Insert activity log
        activity_log = insert_activity_log(
            user_id=user_id,
            campaign_id=inserted_campaign["id"],  # use the database-generated UUID
            action="Started lead scraping",
            metadata=campaign_data
        )

        # 4️⃣ Return response
        return {
            "campaign": inserted_campaign,
            "activity_log": activity_log
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
