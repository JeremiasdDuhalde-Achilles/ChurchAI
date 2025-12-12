# app/api/v1/church/endpoints.py - VERSIÓN CORREGIDA SIN IMPORTS CIRCULARES
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import logging

from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repository import ChurchRepository
from app.api.v1.church.schemas import ChurchRegistrationRequest, ChurchRegistrationResponse
from app.api.v1.auth.dependencies import get_current_active_user
from app.infrastructure.database.models.user import UserModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/churches", tags=["churches"])

def enhanced_ai_risk_assessment(church_data: dict, request_data: dict) -> dict:
    """Enhanced AI risk assessment with detailed analysis"""
    
    try:
        score = 0.0
        risk_factors = []
        positive_indicators = []
        
        name = church_data.get("church_name", "").strip().lower()
        if name:
            if len(name) >= 5:
                positive_indicators.append("Church name has adequate length")
            else:
                risk_factors.append("Church name is very short")
                score += 0.1
                
            church_words = ['iglesia', 'church', 'templo', 'casa', 'ministerio', 'mision']
            if any(word in name for word in church_words):
                positive_indicators.append("Church name contains religious terminology")
            else:
                score += 0.05
        
        email = church_data.get("contact_email", "")
        if email:
            domain = email.split('@')[-1].lower()
            
            temp_domains = ['test.com', 'example.com', 'temp.com', 'fake.com']
            if any(temp in domain for temp in temp_domains):
                risk_factors.append("Temporary email domain detected")
                score += 0.2
            elif 'gmail.com' in domain or 'hotmail.com' in domain or 'yahoo.com' in domain:
                positive_indicators.append("Using established email provider")
            else:
                positive_indicators.append("Using potentially custom domain")
        
        denomination = church_data.get("denomination", "").lower()
        if denomination:
            legitimate_denominations = [
                'catolica', 'evangelica', 'pentecostal', 'bautista', 'metodista', 
                'presbiteriana', 'adventista', 'cristiana', 'anglicana', 'luterana'
            ]
            if any(denom in denomination for denom in legitimate_denominations):
                positive_indicators.append("Recognized denominational affiliation")
            else:
                positive_indicators.append("Custom or emerging denominational identity")
        
        legal_rep = church_data.get("legal_representative", "")
        if legal_rep:
            religious_titles = ['pastor', 'reverendo', 'obispo', 'padre', 'ministro']
            if any(title in legal_rep.lower() for title in religious_titles):
                positive_indicators.append("Legal representative has religious title")
            else:
                positive_indicators.append("Legal representative identified")
        
        website = church_data.get("website_url")
        if website and website.strip():
            positive_indicators.append("Church has web presence")
        else:
            positive_indicators.append("Church may be local/community focused")
        
        user_agent = request_data.get("user_agent", "")
        if "bot" in user_agent.lower() or "crawler" in user_agent.lower():
            risk_factors.append("Automated request detected")
            score += 0.3
        else:
            positive_indicators.append("Human user interaction detected")
        
        final_score = min(score, 0.8)
        
        if final_score < 0.2:
            recommendation = "approve"
            reasoning = "Low risk church registration with good legitimacy indicators"
        elif final_score < 0.5:
            recommendation = "review"
            reasoning = "Medium risk registration requiring manual validation"
        else:
            recommendation = "review"
            reasoning = "Higher risk registration requiring careful manual review"
        
        logger.info(f"AI risk assessment completed: {final_score:.3f} for church: {church_data.get('church_name', 'Unknown')}")
        
        return {
            "risk_score": final_score,
            "risk_factors": risk_factors if risk_factors else ["No significant risk factors identified"],
            "positive_indicators": positive_indicators,
            "recommendation": recommendation,
            "reasoning": reasoning,
            "assessment_details": {
                "name_analysis": "completed",
                "email_analysis": "completed", 
                "denomination_analysis": "completed",
                "technical_analysis": "completed"
            }
        }
        
    except Exception as e:
        logger.error(f"Error in AI risk assessment: {e}")
        return {
            "risk_score": 0.3,
            "risk_factors": ["AI assessment service temporarily unavailable"],
            "positive_indicators": ["Manual review recommended"],
            "recommendation": "review",
            "reasoning": "Fallback assessment due to technical issues"
        }

@router.post("/register", response_model=ChurchRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_church(
    request: ChurchRegistrationRequest,
    http_request: Request,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> ChurchRegistrationResponse:
    """Register a new church - REQUIRES AUTHENTICATION"""
    try:
        logger.info(f"🛐 Church registration by user: {current_user.email}")
        
        # Verificar permisos
        if not current_user.can_create_church:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para crear una iglesia. Tu solicitud está pendiente de aprobación."
            )
        
        # Verificar que no tenga iglesia
        if current_user.church_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya tienes una iglesia registrada"
            )
        
        church_id = uuid.uuid4()
        
        assessment_data = {
            "church_name": request.name,
            "denomination": request.denomination,
            "website_url": request.website_url,
            "contact_email": request.contact_info.primary_email,
            "legal_representative": request.legal_documentation.legal_representative_name,
            "registration_authority": request.legal_documentation.registration_authority,
            "registration_number": request.legal_documentation.registration_number,
            "founding_date": request.founding_date,
            "organizational_structure": request.organizational_structure,
            "estimated_size": request.estimated_size
        }
        
        request_metadata = {
            "requester_ip": http_request.client.host if http_request.client else "unknown",
            "user_agent": http_request.headers.get("user-agent", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        ai_assessment = enhanced_ai_risk_assessment(assessment_data, request_metadata)
        risk_score = ai_assessment["risk_score"]
        
        # Save to database
        repository = ChurchRepository(db)
        saved_church = await repository.save_church_registration(
            request, 
            church_id, 
            ai_assessment, 
            current_user.id  # owner_user_id
        )
        
        # Link user to church
        from app.infrastructure.database.repositories.user_repository import UserRepository
        user_repo = UserRepository(db)
        await user_repo.link_user_to_church(current_user, church_id)
        
        # Determine status
        if risk_score < 0.25:
            status_value = "validated"
            validation_required = False
            estimated_time = "Inmediato"
            status_message = "¡Excelente! Tu iglesia ha sido validada automáticamente."
            next_steps = [
                "✅ Iglesia validada por IA",
                "📧 Revisa tu email",
                "👥 Comienza a registrar miembros",
                "🎯 Explora funciones de IA"
            ]
        else:
            status_value = "pending_validation"
            validation_required = True
            estimated_time = "24-48 horas"
            status_message = "Tu iglesia está en proceso de validación."
            next_steps = [
                "📋 Revisión manual en progreso",
                "📧 Recibirás actualización pronto"
            ]
        
        logger.info(f"✅ Church registered: {church_id}")
        
        return ChurchRegistrationResponse(
            success=True,
            message=status_message,
            data={
                "church_id": str(church_id),
                "name": request.name,
                "status": status_value,
                "validation_required": validation_required,
                "estimated_validation_time": estimated_time,
                "next_steps": next_steps,
                "ai_assessment": {
                    "risk_score": risk_score,
                    "recommendation": ai_assessment["recommendation"],
                    "positive_indicators_count": len(ai_assessment["positive_indicators"]),
                    "risk_factors_count": len(ai_assessment["risk_factors"])
                },
                "registration_metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "processed_by": "ChurchAI v1.0",
                    "database_saved": True,
                    "registered_by": current_user.email
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/health")
async def church_health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "Church Registration API",
        "version": "1.0.0"
    }

@router.get("/debug")
async def debug_info():
    """Debug info"""
    return {
        "router_prefix": "/churches",
        "full_endpoint": "/api/v1/churches/register",
        "requires_auth": True,
        "status": "active",
        "timestamp": datetime.utcnow().isoformat()
    }