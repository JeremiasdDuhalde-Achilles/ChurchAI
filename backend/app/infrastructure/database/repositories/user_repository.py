# app/infrastructure/database/repositories/user_repository.py
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
import logging

from app.infrastructure.database.models.user import UserModel, UserApprovalLogModel, UserStatus, UserRole
from app.infrastructure.database.models.church import ChurchModel
from app.core.security import get_password_hash, generate_email_verification_token

logger = logging.getLogger(__name__)

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_user(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: str,
        registration_type: str,
        phone: Optional[str] = None,
        pastor_info: Optional[dict] = None,
        pending_church_id: Optional[UUID] = None
    ) -> UserModel:
        """Crear un nuevo usuario"""
        try:
            # Hash de password
            password_hash = get_password_hash(password)
            
            # Token de verificación de email
            email_token = generate_email_verification_token()
            
            # Crear usuario
            user = UserModel(
                email=email,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                role=role,
                registration_type=registration_type,
                status=UserStatus.PENDING_APPROVAL,
                can_create_church=False,
                pending_church_id=pending_church_id,
                email_verification_token=email_token,
                email_verification_sent_at=datetime.utcnow()
            )
            
            # Agregar información pastoral si existe
            if pastor_info:
                user.denomination = pastor_info.get('denomination')
                user.years_in_ministry = pastor_info.get('years_in_ministry')
                user.current_church_name = pastor_info.get('current_church_name')
                user.ordination_certificate_url = pastor_info.get('ordination_certificate_url')
                user.reference_letter_url = pastor_info.get('reference_letter_url')
            
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            
            logger.info(f"✅ User created: {user.id} - {user.email}")
            return user
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error creating user: {e}")
            raise
    
    async def find_by_email(self, email: str) -> Optional[UserModel]:
        """Buscar usuario por email"""
        try:
            stmt = select(UserModel).where(UserModel.email == email)
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"❌ Error finding user by email: {e}")
            return None
    
    async def find_by_id(self, user_id: UUID) -> Optional[UserModel]:
        """Buscar usuario por ID con relaciones"""
        try:
            stmt = select(UserModel).options(
                selectinload(UserModel.church),
                selectinload(UserModel.owned_churches)
            ).where(UserModel.id == user_id)
            
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"❌ Error finding user by ID: {e}")
            return None
    
    async def update_user(self, user: UserModel) -> UserModel:
        """Actualizar usuario"""
        try:
            user.updated_at = datetime.utcnow()
            await self.session.commit()
            await self.session.refresh(user)
            return user
        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error updating user: {e}")
            raise
    
    async def update_approval_status(
        self,
        user: UserModel,
        status: UserStatus,
        ai_score: Optional[float] = None,
        ai_notes: Optional[dict] = None,
        can_create_church: bool = False,
        reviewed_by: Optional[UUID] = None,
        rejection_reason: Optional[str] = None
    ) -> UserModel:
        """Actualizar estado de aprobación del usuario"""
        try:
            previous_status = user.status
            
            user.status = status
            user.ai_approval_score = ai_score
            user.ai_approval_notes = ai_notes
            user.can_create_church = can_create_church
            
            if reviewed_by:
                user.approval_reviewed_by = reviewed_by
                user.approval_reviewed_at = datetime.utcnow()
            
            if rejection_reason:
                user.rejection_reason = rejection_reason
            
            # Crear log de aprobación
            approval_log = UserApprovalLogModel(
                user_id=user.id,
                action="auto_approved" if not reviewed_by else "manual_approved",
                performed_by=reviewed_by,
                ai_score=ai_score,
                previous_status=previous_status,
                new_status=status
            )
            
            self.session.add(approval_log)
            await self.update_user(user)
            
            logger.info(f"✅ User approval updated: {user.id} - Status: {status}")
            return user
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error updating approval status: {e}")
            raise
    
    async def update_last_login(self, user: UserModel) -> None:
        """Actualizar último login"""
        try:
            user.last_login = datetime.utcnow()
            user.last_activity = datetime.utcnow()
            await self.session.commit()
        except Exception as e:
            logger.error(f"❌ Error updating last login: {e}")
    
    async def verify_email(self, token: str) -> Optional[UserModel]:
        """Verificar email usando token"""
        try:
            stmt = select(UserModel).where(UserModel.email_verification_token == token)
            result = await self.session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                user.is_email_verified = True
                user.email_verification_token = None
                await self.update_user(user)
                logger.info(f"✅ Email verified for user: {user.id}")
            
            return user
        except Exception as e:
            logger.error(f"❌ Error verifying email: {e}")
            return None
    
    async def link_user_to_church(self, user: UserModel, church_id: UUID) -> UserModel:
        """Vincular usuario a una iglesia"""
        try:
            user.church_id = church_id
            user.pending_church_id = None
            await self.update_user(user)
            
            logger.info(f"✅ User {user.id} linked to church {church_id}")
            return user
        except Exception as e:
            logger.error(f"❌ Error linking user to church: {e}")
            raise
    
    async def find_by_church(self, church_id: UUID) -> list[UserModel]:
        """Obtener todos los usuarios de una iglesia"""
        try:
            stmt = select(UserModel).where(UserModel.church_id == church_id)
            result = await self.session.execute(stmt)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"❌ Error finding users by church: {e}")
            return []