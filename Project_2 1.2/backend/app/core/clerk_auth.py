"""
Clerk Authentication Integration
Handles user authentication and sync with Clerk
"""

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import User, UserRole
from typing import Optional
import httpx

class ClerkAuth:
    """Clerk authentication helper"""
    
    CLERK_API_URL = "https://api.clerk.com/v1"
    
    @staticmethod
    async def get_user_from_clerk(clerk_user_id: str) -> Optional[dict]:
        """
        Fetch user data from Clerk API
        """
        headers = {
            "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{ClerkAuth.CLERK_API_URL}/users/{clerk_user_id}",
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"Error fetching user from Clerk: {e}")
        
        return None
    
    @staticmethod
    def sync_user_with_db(clerk_user_id: str, email: str, first_name: str, 
                         last_name: str, role: UserRole = UserRole.STUDENT) -> User:
        """
        Sync or create user from Clerk data
        """
        db = SessionLocal()
        try:
            # Check if user exists
            user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
            
            if not user:
                # Create new user
                user = User(
                    clerk_user_id=clerk_user_id,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    is_active=True,
                    is_approved=(role == UserRole.STUDENT)  # Students auto-approved
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                # Update existing user
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                db.commit()
                db.refresh(user)
            
            return user
        finally:
            db.close()

    @staticmethod
    async def verify_clerk_session(session_token: str) -> Optional[str]:
        """
        Verify Clerk session token and return clerk_user_id
        """
        headers = {
            "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{ClerkAuth.CLERK_API_URL}/sessions/verify",
                    json={"token": session_token},
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("user_id")
        except Exception as e:
            print(f"Error verifying Clerk session: {e}")
        
        return None
