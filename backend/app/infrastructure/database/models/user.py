# app/infrastructure/database/models/user.py
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from enum import Enum

from app.infrastructure.database.models import Base

class UserRole(str, Enum):
    # Roles de administración de iglesia
    PASTOR_PRINCIPAL = "pastor_principal"
    PASTOR_ASOCIADO = "pastor_asociado"
    ADMIN_IGLESIA = "admin_iglesia"
    LIDER_MINISTERIO = "lider_ministerio"
    
    # Roles operativos
    SECRETARIO = "secretario"
    TESORERO = "tesorero"
    VOLUNTARIO = "voluntario"
    
    # Roles de miembros
    MIEMBRO = "miembro"
    VISITANTE = "visitante"
    
    # Rol especial
    SUPER_ADMIN = "super_admin"

class UserStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REJECTED = "rejected"

class RegistrationType(str, Enum):
    PASTOR_NEW_CHURCH = "pastor_new_church"
    STAFF_EXISTING_CHURCH = "staff_existing_church"
    MEMBER = "member"

class UserModel(Base):
    __tablename__ = "users"
    
    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Información personal
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    birth_date = Column(Date, nullable=True)
    
    # Rol y permisos
    role = Column(String(50), nullable=False, default=UserRole.PASTOR_PRINCIPAL)
    status = Column(String(50), nullable=False, default=UserStatus.PENDING_APPROVAL)
    can_create_church = Column(Boolean, default=False)
    registration_type = Column(String(50), nullable=True)
    
    # Relación con iglesia
    church_id = Column(UUID(as_uuid=True), ForeignKey("churches.id"), nullable=True)
    pending_church_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Verificación
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_sent_at = Column(DateTime, nullable=True)
    
    # Información profesional (para pastores)
    denomination = Column(String(200), nullable=True)
    years_in_ministry = Column(Integer, nullable=True)
    current_church_name = Column(String(500), nullable=True)
    ordination_certificate_url = Column(String(1000), nullable=True)
    reference_letter_url = Column(String(1000), nullable=True)
    
    # IA y aprobación
    ai_approval_score = Column(Float, nullable=True)
    ai_approval_notes = Column(JSON, nullable=True)
    approval_reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approval_reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    last_activity = Column(DateTime, nullable=True)
    
    # Relaciones
    church = relationship("ChurchModel", foreign_keys=[church_id], back_populates="users")
    owned_churches = relationship("ChurchModel", foreign_keys="ChurchModel.owner_user_id", back_populates="owner")
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_pastor(self) -> bool:
        return self.role in [UserRole.PASTOR_PRINCIPAL, UserRole.PASTOR_ASOCIADO]
    
    @property
    def is_admin(self) -> bool:
        return self.role in [UserRole.PASTOR_PRINCIPAL, UserRole.ADMIN_IGLESIA, UserRole.SUPER_ADMIN]
    
    @property
    def is_approved(self) -> bool:
        return self.status == UserStatus.ACTIVE
    
    @property
    def has_church(self) -> bool:
        return self.church_id is not None

class UserApprovalLogModel(Base):
    __tablename__ = "user_approval_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    action = Column(String(50), nullable=False)  # approved, rejected, auto_approved
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=True)
    ai_score = Column(Float, nullable=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    user = relationship("UserModel", foreign_keys=[user_id])
    performed_by_user = relationship("UserModel", foreign_keys=[performed_by])