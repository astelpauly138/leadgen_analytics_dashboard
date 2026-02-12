from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from utils.auth_helpers import get_current_user
from supabase_client import supabase

router = APIRouter()


class ScrapedPayload(BaseModel):
    employees: List[Dict[str, Any]]


class ApprovalPayload(BaseModel):
    approved_employees: List[Dict[str, Any]]


@router.get("/dashboard")
def get_dashboard(user = Depends(get_current_user)):
    # Query without forcing a single result to avoid PostgREST error when 0 rows
    dashboard_response = (
        supabase.table("leads_dashboard")
        .select("*")
        .eq("user_id", user.id)
        .execute()
    )

    data = dashboard_response.data

    if not data:
        return {
            "user_id": user.id,
            "scraped_leads": [],
            "total_leads_scraped": 0,
            "ready_to_email_number": 0,
            "ready_to_email_names": [],
            "emails_sent_number": 0,
            "email_sent_names": [],
            "pending_leads": []
        }
    print(data)
    # The response may be a list (rows) or a single object; normalize to single object
    if isinstance(data, list):
        return data[0]

    return data


@router.post("/scraped")
def store_scraped(payload: ScrapedPayload, user = Depends(get_current_user)):
    # Fetch existing dashboard row for the user
    resp = supabase.table("leads_dashboard").select("*").eq("user_id", user.id).execute()
    existing = resp.data[0] if resp.data and isinstance(resp.data, list) and len(resp.data) > 0 else None

    incoming_emps = payload.employees or []

    # dedupe key: prefer work_email, fallback to employee_name+company
    def key_of(emp: Dict[str, Any]):
        return (emp.get('work_email') or f"{emp.get('employee_name','')}-{emp.get('company_name','')}").lower()

    existing_scraped = existing.get('scraped_leads') if existing else []
    existing_scraped = existing_scraped or []
    existing_keys = { key_of(e) for e in existing_scraped }

    to_add = []
    for emp in incoming_emps:
        k = key_of(emp)
        if k not in existing_keys:
            to_add.append(emp)
            existing_keys.add(k)

    new_scraped = existing_scraped + to_add

    # ready_to_email_names: employees not approved yet; append new ones not present
    existing_ready = existing.get('ready_to_email_names') if existing else []
    existing_ready = existing_ready or []
    ready_keys = { key_of(e) for e in existing_ready }
    new_ready_add = [e for e in to_add if key_of(e) not in ready_keys]
    new_ready = existing_ready + new_ready_add

    # total leads scraped is length of scraped_leads
    total_leads_scraped = len(new_scraped)

    row_payload = {
        'user_id': user.id,
        'scraped_leads': new_scraped,
        'total_leads_scraped': total_leads_scraped,
        'ready_to_email_number': len(new_ready),
        'ready_to_email_names': new_ready,
        # preserve existing sent lists
        'emails_sent_number': existing.get('emails_sent_number') if existing else 0,
        'email_sent_names': existing.get('email_sent_names') if existing else [],
        'pending_leads': new_ready
    }

    try:
        if existing:
            update_resp = supabase.table('leads_dashboard').update(row_payload).eq('user_id', user.id).execute()
        else:
            insert_resp = supabase.table('leads_dashboard').insert(row_payload).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store scraped data: {str(e)}")

    return { 'status': 'ok', 'added': len(to_add), 'total_scraped': total_leads_scraped }


@router.post("/approve")
def approve_employees(payload: ApprovalPayload, user = Depends(get_current_user)):
    # Fetch existing dashboard row
    resp = supabase.table('leads_dashboard').select('*').eq('user_id', user.id).execute()
    existing = resp.data[0] if resp.data and isinstance(resp.data, list) and len(resp.data) > 0 else None

    if not existing:
        raise HTTPException(status_code=400, detail='No dashboard data for user')

    existing_scraped = existing.get('scraped_leads') or []
    existing_sent = existing.get('email_sent_names') or []
    existing_ready = existing.get('ready_to_email_names') or []

    def key_of(emp: Dict[str, Any]):
        return (emp.get('work_email') or f"{emp.get('employee_name','')}-{emp.get('company_name','')}").lower()

    sent_keys = { key_of(e) for e in existing_sent }
    ready_keys = { key_of(e) for e in existing_ready }

    approved = payload.approved_employees or []
    new_sent = []
    # Add each approved employee to email_sent_names if not already present
    for emp in approved:
        k = key_of(emp)
        if k not in sent_keys:
            new_sent.append(emp)
            sent_keys.add(k)
        # also remove from ready list if present
        if k in ready_keys:
            ready_keys.remove(k)

    updated_sent = existing_sent + new_sent

    # rebuild ready list filtering out approved ones
    updated_ready = [e for e in existing_ready if key_of(e) in ready_keys]

    row_payload = {
        'email_sent_names': updated_sent,
        'emails_sent_number': len(updated_sent),
        'ready_to_email_names': updated_ready,
        'ready_to_email_number': len(updated_ready)
    }

    try:
        supabase.table('leads_dashboard').update(row_payload).eq('user_id', user.id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update approvals: {str(e)}")

    return { 'status': 'ok', 'added_sent': len(new_sent), 'emails_sent_number': len(updated_sent) }
