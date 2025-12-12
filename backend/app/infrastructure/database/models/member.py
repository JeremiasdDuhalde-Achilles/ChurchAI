# app/infrastructure/database/models/member.py
from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, ForeignKey, JSON, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.infrastructure.database.connection import Base

class MemberModel(Base):
    """Modelo de miembros de la iglesia"""
    __tablename__ = "members"

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    church_id = Column(UUID(as_uuid=True), ForeignKey('churches.id'), nullable=False)
    
    # Información Personal
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    birth_date = Column(Date)
    gender = Column(String(20))
    marital_status = Column(String(50))
    photo_url = Column(String(1000))
    
    # Dirección
    address_street = Column(String(500))
    address_city = Column(String(200))
    address_state = Column(String(100))
    address_postal_code = Column(String(20))
    address_country = Column(String(100), default='Argentina')
    
    # Información Ministerial
    conversion_date = Column(Date)
    baptism_date = Column(Date)
    membership_date = Column(Date, default=datetime.utcnow)
    member_type = Column(String(50), default='visitante')
    member_status = Column(String(50), default='active')
    
    # Familia
    spouse_name = Column(String(200))
    spouse_is_member = Column(Boolean, default=False)
    spouse_member_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=True)
    children_count = Column(Integer, default=0)
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(50))
    emergency_contact_relationship = Column(String(100))
    
    # Dones y Ministerios
    spiritual_gifts = Column(ARRAY(String))
    ministries = Column(ARRAY(String))
    small_group_id = Column(UUID(as_uuid=True), nullable=True)
    small_group_role = Column(String(50))
    
    # Ocupación
    occupation = Column(String(200))
    education_level = Column(String(100))
    skills = Column(ARRAY(String))
    
    # IA y Seguimiento
    commitment_score = Column(Float, default=0.0)
    attendance_rate = Column(Float, default=0.0)
    participation_rate = Column(Float, default=0.0)
    last_attendance = Column(Date)
    last_contact = Column(Date)
    risk_level = Column(String(50), default='bajo')
    ai_notes = Column(JSON)
    
    # Preferencias
    preferred_contact_method = Column(String(50), default='email')
    communication_frequency = Column(String(50), default='semanal')
    receives_newsletter = Column(Boolean, default=True)
    receives_event_notifications = Column(Boolean, default=True)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    notes = Column(Text)
    tags = Column(ARRAY(String))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("ChurchModel", back_populates="members")
    pastoral_notes = relationship("PastoralNoteModel", back_populates="member", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecordModel", back_populates="member", cascade="all, delete-orphan")
    spouse = relationship("MemberModel", remote_side=[id], foreign_keys=[spouse_member_id])


class PastoralNoteModel(Base):
    """Notas pastorales sobre miembros"""
    __tablename__ = "pastoral_notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    pastor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    note_type = Column(String(50), nullable=False)
    title = Column(String(200))
    content = Column(Text, nullable=False)
    
    is_private = Column(Boolean, default=True)
    is_prayer_request = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)
    
    follow_up_date = Column(Date)
    follow_up_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    member = relationship("MemberModel", back_populates="pastoral_notes")
    pastor = relationship("UserModel")


class AttendanceRecordModel(Base):
    """Registro de asistencia de miembros"""
    __tablename__ = "attendance_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    church_id = Column(UUID(as_uuid=True), ForeignKey('churches.id'), nullable=False)
    
    event_type = Column(String(50), nullable=False)
    event_name = Column(String(200))
    event_date = Column(Date, nullable=False)
    
    attended = Column(Boolean, default=True)
    arrival_time = Column(DateTime)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    member = relationship("MemberModel", back_populates="attendance_records")
    church = relationship("ChurchModel")


class MemberInteractionModel(Base):
    """Registro de interacciones con miembros"""
    __tablename__ = "member_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    interaction_type = Column(String(50), nullable=False)
    interaction_channel = Column(String(50))
    
    subject = Column(String(200))
    content = Column(Text)
    
    outcome = Column(String(100))
    sentiment = Column(String(50))
    
    duration_minutes = Column(Integer)
    
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    member = relationship("MemberModel")
    user = relationship("UserModel")
