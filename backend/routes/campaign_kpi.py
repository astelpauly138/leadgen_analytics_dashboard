from fastapi import APIRouter, HTTPException
from supabase_client import supabase

router = APIRouter()


@router.get("/campaign-kpis/{user_id}")
def get_campaign_kpis(user_id: str):
    try:

        result = supabase.schema("analytics") \
            .table("campaign_cards") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()

        return {
            "campaign_kpis": result.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
