from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


class MemberBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_postal_code: Optional[str] = None
    address_country: str = "Argentina"
    conversion_date: Optional[date] = None
    baptism_date: Optional[date] = None
    member_type: str = "visitante"
    spouse_name: Optional[str] = None
    spouse_is_member: bool = False
    children_count: int = 0
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    spiritual_gifts: Optional[List[str]] = []
    ministries: Optional[List[str]] = []
    small_group_role: Optional[str] = None
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    skills: Optional[List[str]] = []
    preferred_contact_method: str = "email"
    communication_frequency: str = "semanal"
    receives_newsletter: bool = True
    receives_event_notifications: bool = True
    notes: Optional[str] = None
    tags: Optional[List[str]] = []


class MemberCreate(MemberBase):
    church_id: UUID
    photo_url: Optional[str] = None


class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    member_type: Optional[str] = None
    ministries: Optional[List[str]] = None
    notes: Optional[str] = None


class MemberResponse(MemberBase):
    id: UUID
    church_id: UUID
    photo_url: Optional[str] = None
    membership_date: date
    member_status: str
    commitment_score: float
    attendance_rate: float
    risk_level: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MemberListItem(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    member_type: str
    commitment_score: float
    attendance_rate: float
    risk_level: str
    ministries: List[str] = []
    
    class Config:
        from_attributes = True


class PastoralNoteBase(BaseModel):
    note_type: str
    title: Optional[str] = None
    content: str = Field(..., min_length=10)
    is_private: bool = True
    is_prayer_request: bool = False


class PastoralNoteCreate(PastoralNoteBase):
    member_id: UUID


class PastoralNoteResponse(PastoralNoteBase):
    id: UUID
    member_id: UUID
    pastor_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class AttendanceRecordCreate(BaseModel):
    member_id: UUID
    church_id: UUID
    event_type: str
    event_date: date
    attended: bool = True


class AttendanceRecordResponse(BaseModel):
    id: UUID
    member_id: UUID
    event_type: str
    event_date: date
    attended: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class MemberStats(BaseModel):
    total_attendance: int
    attendance_rate: float
    commitment_score: float


class ChurchMemberStats(BaseModel):
    total_members: int
    active_members: int
    visitors: int
    inactive_members: int
    new_this_month: int
    new_this_year: int
    average_attendance_rate: float
    average_commitment_score: float
    members_at_risk: int
    members_needing_followup: int
    age_distribution: dict
    gender_distribution: dict
    marital_status_distribution: dict
    member_type_distribution: dict


class MemberAIRecommendation(BaseModel):
    member_id: UUID
    member_name: str
    risk_level: str
    recommended_actions: List[dict]
