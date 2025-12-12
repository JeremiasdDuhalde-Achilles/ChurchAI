from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class MemberAuditLogCreate(BaseModel):
    """Schema para crear log de auditoría"""
    member_id: UUID
    user_id: Optional[UUID] = None
    action: str
    field_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class MemberAuditLogResponse(BaseModel):
    """Schema de respuesta de log de auditoría"""
    id: UUID
    member_id: UUID
    user_id: Optional[UUID]
    action: str
    field_name: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: datetime
    
    # Información del usuario (si está disponible)
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True