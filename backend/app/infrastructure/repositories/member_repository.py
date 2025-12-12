# app/infrastructure/repositories/member_repository.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import date, timedelta

from app.infrastructure.database.models.member import (
    MemberModel, 
    PastoralNoteModel,
    AttendanceRecordModel
)
from app.domain.schemas.member import (
    MemberCreate, 
    MemberUpdate,
    PastoralNoteCreate,
    AttendanceRecordCreate,
    ChurchMemberStats
)


class MemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, member_data: MemberCreate, created_by: UUID) -> MemberModel:
        member = MemberModel(
            **member_data.dict(),
            created_by=created_by,
            membership_date=date.today()
        )
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member
    
    async def get_by_id(self, member_id: UUID) -> Optional[MemberModel]:
        result = await self.session.execute(
            select(MemberModel)
            .where(MemberModel.id == member_id)
            .options(
                selectinload(MemberModel.pastoral_notes),
                selectinload(MemberModel.attendance_records)
            )
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[MemberModel]:
        result = await self.session.execute(
            select(MemberModel).where(MemberModel.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_all_by_church(
        self, 
        church_id: UUID,
        member_type: Optional[str] = None,
        member_status: str = "active",
        risk_level: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MemberModel]:
        query = select(MemberModel).where(MemberModel.church_id == church_id)
        
        if member_type:
            query = query.where(MemberModel.member_type == member_type)
        
        if member_status:
            query = query.where(MemberModel.member_status == member_status)
        
        if risk_level:
            query = query.where(MemberModel.risk_level == risk_level)
        
        query = query.order_by(MemberModel.last_name, MemberModel.first_name)
        query = query.offset(skip).limit(limit)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def search_members(
        self,
        church_id: UUID,
        search_term: str,
        limit: int = 50
    ) -> List[MemberModel]:
        search = f"%{search_term}%"
        query = select(MemberModel).where(
            and_(
                MemberModel.church_id == church_id,
                or_(
                    MemberModel.first_name.ilike(search),
                    MemberModel.last_name.ilike(search),
                    MemberModel.email.ilike(search),
                    MemberModel.phone.ilike(search)
                )
            )
        ).limit(limit)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update(self, member_id: UUID, member_data: MemberUpdate) -> Optional[MemberModel]:
        member = await self.get_by_id(member_id)
        if not member:
            return None
        
        update_data = member_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(member, field, value)
        
        await self.session.commit()
        await self.session.refresh(member)
        return member
    
    async def delete(self, member_id: UUID) -> bool:
        member = await self.get_by_id(member_id)
        if not member:
            return False
        
        member.member_status = "inactive"
        await self.session.commit()
        return True
    
    async def get_church_stats(self, church_id: UUID) -> ChurchMemberStats:
        total_result = await self.session.execute(
            select(func.count(MemberModel.id))
            .where(MemberModel.church_id == church_id)
        )
        total_members = total_result.scalar() or 0
        
        active_result = await self.session.execute(
            select(func.count(MemberModel.id))
            .where(
                and_(
                    MemberModel.church_id == church_id,
                    MemberModel.member_type == "activo",
                    MemberModel.member_status == "active"
                )
            )
        )
        active_members = active_result.scalar() or 0
        
        visitors_result = await self.session.execute(
            select(func.count(MemberModel.id))
            .where(
                and_(
                    MemberModel.church_id == church_id,
                    MemberModel.member_type == "visitante"
                )
            )
        )
        visitors = visitors_result.scalar() or 0
        
        risk_result = await self.session.execute(
            select(func.count(MemberModel.id))
            .where(
                and_(
                    MemberModel.church_id == church_id,
                    MemberModel.risk_level.in_(["alto", "critico"])
                )
            )
        )
        members_at_risk = risk_result.scalar() or 0
        
        today = date.today()
        first_day_month = today.replace(day=1)
        new_month_result = await self.session.execute(
            select(func.count(MemberModel.id))
            .where(
                and_(
                    MemberModel.church_id == church_id,
                    MemberModel.membership_date >= first_day_month
                )
            )
        )
        new_this_month = new_month_result.scalar() or 0
        
        avg_result = await self.session.execute(
            select(
                func.avg(MemberModel.attendance_rate),
                func.avg(MemberModel.commitment_score)
            ).where(MemberModel.church_id == church_id)
        )
        avg_attendance, avg_commitment = avg_result.first() or (0, 0)
        
        return ChurchMemberStats(
            total_members=total_members,
            active_members=active_members,
            visitors=visitors,
            inactive_members=total_members - active_members - visitors,
            new_this_month=new_this_month,
            new_this_year=0,
            average_attendance_rate=float(avg_attendance or 0),
            average_commitment_score=float(avg_commitment or 0),
            members_at_risk=members_at_risk,
            members_needing_followup=0,
            age_distribution={},
            gender_distribution={},
            marital_status_distribution={},
            member_type_distribution={}
        )
    
    async def get_members_at_risk(self, church_id: UUID) -> List[MemberModel]:
        result = await self.session.execute(
            select(MemberModel)
            .where(
                and_(
                    MemberModel.church_id == church_id,
                    MemberModel.risk_level.in_(["alto", "critico"]),
                    MemberModel.member_status == "active"
                )
            )
            .order_by(MemberModel.commitment_score.asc())
        )
        return result.scalars().all()
    
    async def create_note(self, note_data: PastoralNoteCreate, pastor_id: UUID) -> PastoralNoteModel:
        note = PastoralNoteModel(
            **note_data.dict(),
            pastor_id=pastor_id
        )
        self.session.add(note)
        
        member = await self.get_by_id(note_data.member_id)
        if member:
            member.last_contact = date.today()
        
        await self.session.commit()
        await self.session.refresh(note)
        return note
    
    async def get_member_notes(
        self, 
        member_id: UUID, 
        include_private: bool = True
    ) -> List[PastoralNoteModel]:
        query = select(PastoralNoteModel).where(
            PastoralNoteModel.member_id == member_id
        )
        
        if not include_private:
            query = query.where(PastoralNoteModel.is_private == False)
        
        query = query.order_by(PastoralNoteModel.created_at.desc())
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def record_attendance(self, attendance_data: AttendanceRecordCreate) -> AttendanceRecordModel:
        record = AttendanceRecordModel(**attendance_data.dict())
        self.session.add(record)
        
        member = await self.get_by_id(attendance_data.member_id)
        if member and attendance_data.attended:
            member.last_attendance = attendance_data.event_date
        
        await self.session.commit()
        await self.session.refresh(record)
        
        await self.recalculate_attendance_rate(attendance_data.member_id)
        
        return record
    
    async def recalculate_attendance_rate(self, member_id: UUID):
        three_months_ago = date.today() - timedelta(days=90)
        
        result = await self.session.execute(
            select(
                func.count(AttendanceRecordModel.id).label('total'),
                func.sum(func.cast(AttendanceRecordModel.attended, func.INTEGER)).label('attended')
            )
            .where(
                and_(
                    AttendanceRecordModel.member_id == member_id,
                    AttendanceRecordModel.event_date >= three_months_ago
                )
            )
        )
        
        total, attended = result.first() or (0, 0)
        
        if total > 0:
            attendance_rate = (attended / total) * 100
        else:
            attendance_rate = 0
        
        member = await self.get_by_id(member_id)
        if member:
            member.attendance_rate = attendance_rate
            await self.session.commit()
