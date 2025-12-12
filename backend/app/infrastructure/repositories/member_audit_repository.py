from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.infrastructure.database.models.member_audit import MemberAuditLog
from app.domain.schemas.member_audit import MemberAuditLogCreate


class MemberAuditRepository:
    """Repositorio para gestionar auditoría de miembros"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_log(self, log_data: MemberAuditLogCreate) -> MemberAuditLog:
        """Crear registro de auditoría"""
        log = MemberAuditLog(**log_data.model_dump())
        self.session.add(log)
        await self.session.flush()
        return log
    
    async def get_member_history(
        self, 
        member_id: UUID, 
        limit: int = 50
    ) -> List[MemberAuditLog]:
        """Obtener historial de cambios de un miembro"""
        query = (
            select(MemberAuditLog)
            .where(MemberAuditLog.member_id == member_id)
            .order_by(MemberAuditLog.changed_at.desc())
            .limit(limit)
        )
        
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def get_user_actions(
        self, 
        user_id: UUID, 
        limit: int = 50
    ) -> List[MemberAuditLog]:
        """Obtener acciones realizadas por un usuario"""
        query = (
            select(MemberAuditLog)
            .where(MemberAuditLog.user_id == user_id)
            .order_by(MemberAuditLog.changed_at.desc())
            .limit(limit)
        )
        
        result = await self.session.execute(query)
        return list(result.scalars().all())
