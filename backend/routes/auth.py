from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from supabase_client import supabase
import os


# --- FastAPI router ---
router = APIRouter(prefix="/auth")

# --- Pydantic models for request ---
class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    company_name: str = None
    email: EmailStr
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Signup endpoint ---
@router.post("/signup")
def signup(data: SignupRequest):
    # Password match check
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 1️⃣ Create user in Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if auth_response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed")

    user_id = auth_response.user.id

    # 2️⃣ Insert extra profile info into 'profiles' table
    try:
        supabase.table("profiles").insert({
            "id": user_id,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "company_name": data.company_name
        }).execute()
    except Exception as e:
        # Optional: rollback user creation if profile fails
        raise HTTPException(status_code=500, detail=f"Profile creation failed: {e}")

    return {
        "message": "User created",
        "user_id": user_id,
        "email": data.email
    }

# --- Login endpoint ---
@router.post("/login")
def login(data: LoginRequest):
    try:
        login_response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        msg = str(e)
        if 'timed out' in msg.lower() or 'timeout' in msg.lower() or 'read' in msg.lower():
            raise HTTPException(status_code=504, detail="Upstream auth request timed out")
        raise HTTPException(status_code=400, detail=msg)

    if not login_response or getattr(login_response, 'user', None) is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Fetch user profile info from profiles table
    user_id = login_response.user.id
    try:
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        profile = profile_response.data if profile_response.data else {}
    except Exception:
        profile = {}
    
    # Return access token and user info
    return {
        "access_token": login_response.session.access_token,
        "user": {
            "user_id": login_response.user.id,
            "email": login_response.user.email,
            "first_name": profile.get("first_name", ""),
            "last_name": profile.get("last_name", ""),
            "company_name": profile.get("company_name", "")
        }
    }
