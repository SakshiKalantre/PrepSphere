from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import json
import hmac
import hashlib
from typing import Dict, Any

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.config import settings

router = APIRouter()

# Webhook secret from Clerk dashboard
# In production, this should be stored in environment variables
WEBHOOK_SECRET = "whsec_your_webhook_secret_here"

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify the webhook signature from Clerk
    """
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def clerk_webhook(
    request: Request, 
    db: Session = Depends(get_db)
):
    """
    Handle Clerk webhook events for user creation and updates
    """
    # Get the payload
    payload = await request.body()
    
    # Get the signature from headers
    signature = request.headers.get("svix-signature")
    
    # Verify the webhook signature (in production)
    # if not verify_webhook_signature(payload, signature, WEBHOOK_SECRET):
    #     raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse the JSON payload
    try:
        data = json.loads(payload.decode('utf-8'))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    # Handle different event types
    event_type = data.get("type")
    
    if event_type == "user.created":
        return handle_user_created(data, db)
    elif event_type == "user.updated":
        return handle_user_updated(data, db)
    elif event_type == "user.deleted":
        return handle_user_deleted(data, db)
    
    return {"message": "Event processed"}

def handle_user_created(data: Dict[str, Any], db: Session):
    """
    Handle user creation event from Clerk
    """
    user_data = data.get("data", {})
    
    # Extract user information
    clerk_user_id = user_data.get("id")
    email_addresses = user_data.get("email_addresses", [])
    first_name = user_data.get("first_name", "")
    last_name = user_data.get("last_name", "")
    
    # Get email (primary email if multiple)
    email = ""
    if email_addresses:
        primary_email = next((email for email in email_addresses if email.get("id") == user_data.get("primary_email_address_id")), email_addresses[0])
        email = primary_email.get("email_address", "")
    
    # Get role from unsafe_metadata
    unsafe_metadata = user_data.get("unsafe_metadata", {})
    role = unsafe_metadata.get("role", "STUDENT")  # Default to STUDENT
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if existing_user:
        return {"message": "User already exists"}
    
    # Create new user with the role from signup
    db_user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role  # This will use the role selected during signup
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User created successfully", "user_id": db_user.id}

def handle_user_updated(data: Dict[str, Any], db: Session):
    """
    Handle user update event from Clerk
    """
    user_data = data.get("data", {})
    clerk_user_id = user_data.get("id")
    
    # Find user in database
    db_user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user information
    email_addresses = user_data.get("email_addresses", [])
    if email_addresses:
        primary_email = next((email for email in email_addresses if email.get("id") == user_data.get("primary_email_address_id")), email_addresses[0])
        db_user.email = primary_email.get("email_address", "")
    
    db_user.first_name = user_data.get("first_name", db_user.first_name)
    db_user.last_name = user_data.get("last_name", db_user.last_name)
    
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User updated successfully"}

def handle_user_deleted(data: Dict[str, Any], db: Session):
    """
    Handle user deletion event from Clerk
    """
    user_data = data.get("data", {})
    clerk_user_id = user_data.get("id")
    
    # Find and delete user
    db_user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "User deleted successfully"}