# app/infrastructure/database/repository.py - CORREGIDO
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import logging

from app.infrastructure.database.models.church import ChurchModel, AddressModel, ContactInfoModel, LegalDocumentModel
from app.api.v1.church.schemas import ChurchRegistrationRequest

logger = logging.getLogger(__name__)

class ChurchRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def save_church_registration(
        self, 
        request: ChurchRegistrationRequest, 
        church_id: UUID, 
        ai_assessment: dict,
        owner_user_id: UUID  # NUEVO PARÁMETRO
    ) -> ChurchModel:
        """Save church registration to database"""
        try:
            # Create church model
            church = ChurchModel(
                id=church_id,
                owner_user_id=owner_user_id,  # NUEVO
                name=request.name,
                denomination=request.denomination,
                organizational_structure=request.organizational_structure,
                estimated_size=request.estimated_size,
                founding_date=request.founding_date,
                website_url=request.website_url,
                social_media=request.social_media,
                status=self._determine_status(ai_assessment["risk_score"]),
                legal_registration_number=request.legal_documentation.registration_number,
                legal_representative_name=request.legal_documentation.legal_representative_name,
                legal_representative_id=request.legal_documentation.legal_representative_id,
                legal_representative_position=request.legal_documentation.legal_representative_position,
                registration_authority=request.legal_documentation.registration_authority,
                registration_date=request.legal_documentation.registration_date,
                ai_risk_score=ai_assessment["risk_score"],
                ai_recommendation=ai_assessment["recommendation"],
                validation_notes=ai_assessment.get("risk_factors", [])
            )
            
            # Create address
            address = AddressModel(
                church_id=church_id,
                street=request.address.street,
                number=request.address.number,
                neighborhood=request.address.neighborhood,
                city=request.address.city,
                state=request.address.state,
                postal_code=request.address.postal_code,
                country=request.address.country
            )
            
            # Create contact info
            contact_info = ContactInfoModel(
                church_id=church_id,
                primary_email=request.contact_info.primary_email,
                secondary_email=request.contact_info.secondary_email,
                primary_phone=request.contact_info.primary_phone,
                secondary_phone=getattr(request.contact_info, 'secondary_phone', None),
                whatsapp=getattr(request.contact_info, 'whatsapp', None),
                emergency_contact_name=getattr(request.contact_info, 'emergency_contact_name', None),
                emergency_contact_phone=getattr(request.contact_info, 'emergency_contact_phone', None)
            )
            
            # Create legal documents
            legal_documents = []
            for doc in request.legal_documentation.documents:
                legal_doc = LegalDocumentModel(
                    church_id=church_id,
                    document_type=doc.document_type,
                    document_number=doc.document_number,
                    issued_date=doc.issued_date,
                    expiry_date=getattr(doc, 'expiry_date', None),
                    issuing_authority=doc.issuing_authority,
                    file_url=getattr(doc, 'file_url', None)
                )
                legal_documents.append(legal_doc)
            
            # Add all to session
            self.session.add(church)
            self.session.add(address)
            self.session.add(contact_info)
            for doc in legal_documents:
                self.session.add(doc)
            
            # Commit transaction
            await self.session.commit()
            
            logger.info(f"✅ Church saved: {church_id} - {request.name}")
            return church
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error saving church: {e}")
            raise
    
    async def find_church_by_id(self, church_id: UUID) -> Optional[ChurchModel]:
        """Find church by ID with all relationships"""
        try:
            stmt = select(ChurchModel).options(
                selectinload(ChurchModel.address),
                selectinload(ChurchModel.contact_info),
                selectinload(ChurchModel.legal_documents)
            ).where(ChurchModel.id == church_id)
            
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"❌ Error finding church: {e}")
            return None
    
    async def find_church_by_email(self, email: str) -> Optional[ChurchModel]:
        """Find church by email"""
        try:
            stmt = select(ChurchModel).join(ContactInfoModel).where(
                ContactInfoModel.primary_email == email
            )
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"❌ Error finding church by email: {e}")
            return None
    
    async def get_all_churches(self, limit: int = 100) -> list[ChurchModel]:
        """Get all churches"""
        try:
            stmt = select(ChurchModel).limit(limit).order_by(ChurchModel.created_at.desc())
            result = await self.session.execute(stmt)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"❌ Error getting churches: {e}")
            return []
    
    def _determine_status(self, risk_score: float) -> str:
        """Determine church status based on AI risk score"""
        if risk_score < 0.25:
            return "validated"
        elif risk_score < 0.5:
            return "pending_validation"
        else:
            return "under_review"