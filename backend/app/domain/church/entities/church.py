from datetime import datetime
from typing import List, Optional
from enum import Enum
from uuid import UUID, uuid4

from app.domain.shared.base_entity import BaseEntity, DomainEvent

class ChurchSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    MEGA = "mega"

class ChurchStatus(str, Enum):
    PENDING_VALIDATION = "pending_validation"
    VALIDATED = "validated"
    REJECTED = "rejected"
    ACTIVE = "active"

class OrganizationalStructure(str, Enum):
    TRADITIONAL = "traditional"
    CELLS = "cells"
    G12 = "g12"
    NETWORK = "network"
    MINISTRIES = "ministries"
    CUSTOM = "custom"

class ChurchRegistered(DomainEvent):
    def __init__(self, church_id: UUID, name: str, denomination: str, contact_email: str, occurred_at: datetime):
        super().__init__(occurred_at)
        self.church_id = church_id
        self.name = name
        self.denomination = denomination
        self.contact_email = contact_email

class Church(BaseEntity):
    def __init__(self, church_id: UUID, name: str, denomination: str, created_at: Optional[datetime] = None):
        super().__init__(church_id, created_at)
        self.name = name
        self.denomination = denomination
        self.status = ChurchStatus.PENDING_VALIDATION
        self.validation_notes: List[str] = []
        self.ai_risk_score: Optional[float] = None
    
    @classmethod
    def register(cls, name: str, denomination: str) -> "Church":
        church_id = uuid4()
        church = cls(church_id=church_id, name=name, denomination=denomination)
        church.record_event(ChurchRegistered(
            church_id=church_id,
            name=name,
            denomination=denomination,
            contact_email="test@example.com",
            occurred_at=datetime.utcnow()
        ))
        return church
    
    def validate_church(self, validation_notes: List[str], ai_risk_score: float) -> None:
        self.validation_notes = validation_notes
        self.ai_risk_score = ai_risk_score
        
        if ai_risk_score > 0.8:
            self.status = ChurchStatus.REJECTED
        else:
            self.status = ChurchStatus.VALIDATED
    
    def is_active(self) -> bool:
        return self.status == ChurchStatus.ACTIVE
