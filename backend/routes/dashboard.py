from fastapi import APIRouter, HTTPException
import asyncio
from supabase_client import supabase

router = APIRouter()


def get_dashboard_kpis_sync(user_id: str):
    result = supabase.schema("analytics") \
        .table("dashboard_cards") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return result.data


def get_activity_logs_sync(user_id: str):
    result = supabase.schema("analytics") \
        .table("activity_logs_view") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return result.data


@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    try:
        dashboard_task = asyncio.to_thread(get_dashboard_kpis_sync, user_id)
        activity_task = asyncio.to_thread(get_activity_logs_sync, user_id)

        dashboard_result, activity_result = await asyncio.gather(
            dashboard_task,
            activity_task
        )

        return {
            "dashboard_kpis": dashboard_result,
            "activity_logs": activity_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
