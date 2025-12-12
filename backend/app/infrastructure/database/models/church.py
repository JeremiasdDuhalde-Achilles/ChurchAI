# app/infrastructure/database/models/church.py
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import secrets

from app.infrastructure.database.models import Base

def generate_invitation_code():
    """Genera un código único de 8 caracteres para invitaciones"""
    return secrets.token_urlsafe(6).upper()[:8]

class ChurchModel(Base):
    __tablename__ = "churches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Owner - Pastor que registró la iglesia
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Información básica
    name = Column(String(500), nullable=False, index=True)
    denomination = Column(String(500), nullable=False)
    organizational_structure = Column(String(100), default="traditional")
    estimated_size = Column(String(50), default="medium")
    founding_date = Column(String(50), nullable=False)
    website_url = Column(String(500), nullable=True)
    social_media = Column(JSON, nullable=True)
    
    # Código de invitación único para que otros usuarios se unan
    invitation_code = Column(String(20), unique=True, nullable=False, default=generate_invitation_code)
    
    # Status and validation
    status = Column(String(50), default="pending_validation", index=True)
    ai_risk_score = Column(Float, nullable=True)
    ai_recommendation = Column(String(100), nullable=True)
    validation_notes = Column(JSON, nullable=True)
    
    # Legal information
    legal_registration_number = Column(String(500), nullable=False)
    legal_representative_name = Column(String(500), nullable=False)
    legal_representative_id = Column(String(200), nullable=False)
    legal_representative_position = Column(String(200), default="Pastor Principal")
    registration_authority = Column(String(500), nullable=False)
    registration_date = Column(String(50), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    owner = relationship("UserModel", foreign_keys=[owner_user_id], back_populates="owned_churches")
    users = relationship("UserModel", foreign_keys="UserModel.church_id", back_populates="church")
    address = relationship("AddressModel", back_populates="church", uselist=False)
    contact_info = relationship("ContactInfoModel", back_populates="church", uselist=False)
    legal_documents = relationship("LegalDocumentModel", back_populates="church")
    members = relationship("MemberModel", back_populates="church", cascade="all, delete-orphan")

class AddressModel(Base):
    __tablename__ = "addresses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    church_id = Column(UUID(as_uuid=True), ForeignKey("churches.id"), nullable=False)
    
    street = Column(String(500), nullable=False)
    number = Column(String(50), nullable=False)
    neighborhood = Column(String(200), nullable=False)
    city = Column(String(200), nullable=False)
    state = Column(String(200), nullable=False)
    postal_code = Column(String(50), nullable=False)
    country = Column(String(200), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("ChurchModel", back_populates="address")

class ContactInfoModel(Base):
    __tablename__ = "contact_info"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    church_id = Column(UUID(as_uuid=True), ForeignKey("churches.id"), nullable=False)
    
    primary_email = Column(String(255), nullable=False, index=True)
    secondary_email = Column(String(255), nullable=True)
    primary_phone = Column(String(50), nullable=False)
    secondary_phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    emergency_contact_name = Column(String(500), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("ChurchModel", back_populates="contact_info")

class LegalDocumentModel(Base):
    __tablename__ = "legal_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    church_id = Column(UUID(as_uuid=True), ForeignKey("churches.id"), nullable=False)
    
    document_type = Column(String(100), nullable=False)
    document_number = Column(String(500), nullable=False)
    issued_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=True)
    issuing_authority = Column(String(500), nullable=False)
    file_url = Column(String(1000), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("ChurchModel", back_populates="legal_documents")
# NOTA: Agregar esta línea después de las otras relaciones en ChurchModel
# Si ya existe una sección de relaciones, agregar ahí:
# members = relationship("MemberModel", back_populates="church", cascade="all, delete-orphan")
