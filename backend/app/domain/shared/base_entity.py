from datetime import datetime
from typing import List, Optional
from uuid import UUID
from dataclasses import dataclass, field

@dataclass
class DomainEvent:
    occurred_at: datetime
    
    def __post_init__(self):
        if not self.occurred_at:
            self.occurred_at = datetime.utcnow()

@dataclass
class BaseEntity:
    id: UUID
    created_at: Optional[datetime] = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    _domain_events: List[DomainEvent] = field(default_factory=list, init=False)
    
    def record_event(self, event: DomainEvent) -> None:
        self._domain_events.append(event)
    
    def get_events(self) -> List[DomainEvent]:
        return self._domain_events.copy()
    
    def clear_events(self) -> None:
        self._domain_events.clear()
