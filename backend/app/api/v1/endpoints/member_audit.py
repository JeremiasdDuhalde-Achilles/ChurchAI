from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from uuid import UUID
from typing import List, Dict, Any

from app.infrastructure.database.connection import get_db
from app.api.v1.auth.dependencies import get_current_user
from app.infrastructure.database.models.user import UserModel

# SIN PREFIX - se agregará desde __init__.py
router = APIRouter(tags=["members"])

@router.get("/members/{member_id}/history", response_model=List[Dict[str, Any]])
async def get_member_history(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Obtener historial de cambios de un miembro
    
    Retorna lista de todos los cambios realizados en el miembro,
    ordenados del más reciente al más antiguo.
    """
    
    query = text("""
        SELECT 
            id::text as id,
            member_id::text as member_id,
            user_id::text as user_id,
            action,
            field_name,
            old_value,
            new_value,
            changed_at
        FROM member_audit_log
        WHERE member_id = :member_id
        ORDER BY changed_at DESC
        LIMIT 50
    """)
    
    result = await session.execute(query, {"member_id": str(member_id)})
    rows = result.fetchall()
    
    history = []
    for row in rows:
        history.append({
            "id": row.id,
            "member_id": row.member_id,
            "user_id": row.user_id,
            "action": row.action,
            "field_name": row.field_name,
            "old_value": row.old_value,
            "new_value": row.new_value,
            "changed_at": row.changed_at.isoformat() if row.changed_at else None,
            "user_name": None
        })
    
    return history