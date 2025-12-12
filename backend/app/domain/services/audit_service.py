from typing import Any, Dict, Optional
from uuid import UUID
from fastapi import Request

from app.infrastructure.repositories.member_audit_repository import MemberAuditRepository
from app.domain.schemas.member_audit import MemberAuditLogCreate


class AuditService:
    """Servicio para gestionar auditoría"""
    
    @staticmethod
    async def log_member_change(
        repo: MemberAuditRepository,
        member_id: UUID,
        user_id: Optional[UUID],
        action: str,
        field_name: Optional[str] = None,
        old_value: Any = None,
        new_value: Any = None,
        request: Optional[Request] = None
    ) -> None:
        """
        Registrar cambio en un miembro
        
        Args:
            repo: Repositorio de auditoría
            member_id: ID del miembro
            user_id: ID del usuario que hizo el cambio
            action: Tipo de acción (create, update, delete)
            field_name: Campo modificado (para updates)
            old_value: Valor anterior
            new_value: Valor nuevo
            request: Request de FastAPI (para obtener IP y user agent)
        """
        # Obtener IP y user agent si hay request
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get('user-agent')
        
        # Convertir valores a string
        old_str = str(old_value) if old_value is not None else None
        new_str = str(new_value) if new_value is not None else None
        
        # Crear log
        log_data = MemberAuditLogCreate(
            member_id=member_id,
            user_id=user_id,
            action=action,
            field_name=field_name,
            old_value=old_str,
            new_value=new_str,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        await repo.create_log(log_data)
    
    @staticmethod
    async def log_member_create(
        repo: MemberAuditRepository,
        member_id: UUID,
        user_id: UUID,
        request: Optional[Request] = None
    ) -> None:
        """Registrar creación de miembro"""
        await AuditService.log_member_change(
            repo=repo,
            member_id=member_id,
            user_id=user_id,
            action="create",
            request=request
        )
    
    @staticmethod
    async def log_member_update(
        repo: MemberAuditRepository,
        member_id: UUID,
        user_id: UUID,
        changes: Dict[str, tuple],  # {field: (old_value, new_value)}
        request: Optional[Request] = None
    ) -> None:
        """Registrar actualización de miembro"""
        for field, (old_val, new_val) in changes.items():
            await AuditService.log_member_change(
                repo=repo,
                member_id=member_id,
                user_id=user_id,
                action="update",
                field_name=field,
                old_value=old_val,
                new_value=new_val,
                request=request
            )
    
    @staticmethod
    async def log_member_delete(
        repo: MemberAuditRepository,
        member_id: UUID,
        user_id: UUID,
        request: Optional[Request] = None
    ) -> None:
        """Registrar eliminación de miembro"""
        await AuditService.log_member_change(
            repo=repo,
            member_id=member_id,
            user_id=user_id,
            action="delete",
            request=request
        )