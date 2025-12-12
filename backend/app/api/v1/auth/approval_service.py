# app/api/v1/auth/approval_service.py
from typing import Dict, Any, List
import re
import logging

logger = logging.getLogger(__name__)

class UserApprovalService:
    """
    Servicio de IA para evaluar y aprobar registros de pastores
    """
    
    # Dominios de email conocidos de iglesias
    CHURCH_DOMAINS = [
        'church.org', 'iglesia.org', 'ministerio.org', 'templo.org',
        'pastoral.com', 'pastor.com', 'cristianos.org'
    ]
    
    # Denominaciones reconocidas
    RECOGNIZED_DENOMINATIONS = [
        'evangelica', 'pentecostal', 'bautista', 'metodista',
        'presbiteriana', 'adventista', 'anglicana', 'luterana',
        'catolica', 'cristiana', 'apostolica', 'reformada'
    ]
    
    @classmethod
    def assess_pastor_registration(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evalúa la solicitud de registro de un pastor usando IA
        
        Returns:
            {
                "score": float (0.0 - 1.0),
                "decision": str (auto_approve, manual_review, request_more_info),
                "message": str,
                "factors": List[str],
                "estimated_approval_time": str
            }
        """
        score = 0.0
        positive_factors = []
        negative_factors = []
        
        try:
            # 1. Análisis de email (0-30 puntos)
            email_score, email_factors = cls._analyze_email(user_data.get('email', ''))
            score += email_score
            positive_factors.extend(email_factors)
            
            # 2. Análisis de información pastoral (0-40 puntos)
            pastor_info = user_data.get('pastor_info', {})
            if pastor_info:
                pastoral_score, pastoral_factors = cls._analyze_pastoral_info(pastor_info)
                score += pastoral_score
                positive_factors.extend(pastoral_factors)
            else:
                negative_factors.append("No se proporcionó información pastoral")
            
            # 3. Análisis de documentación (0-30 puntos)
            doc_score, doc_factors = cls._analyze_documentation(pastor_info)
            score += doc_score
            positive_factors.extend(doc_factors)
            
            # 4. Verificaciones adicionales
            if len(user_data.get('first_name', '')) > 0 and len(user_data.get('last_name', '')) > 0:
                score += 0.05
                positive_factors.append("Nombre completo proporcionado")
            
            # Normalizar score a 0-1
            score = min(score, 1.0)
            
            # Tomar decisión
            decision, message, estimated_time = cls._make_decision(score, positive_factors, negative_factors)
            
            logger.info(f"Pastor registration assessment: score={score:.3f}, decision={decision}")
            
            return {
                "score": round(score, 3),
                "decision": decision,
                "message": message,
                "positive_factors": positive_factors,
                "negative_factors": negative_factors,
                "estimated_approval_time": estimated_time,
                "can_create_church": decision == "auto_approve"
            }
            
        except Exception as e:
            logger.error(f"Error in pastor assessment: {e}")
            return {
                "score": 0.3,
                "decision": "manual_review",
                "message": "Error en evaluación automática. Requiere revisión manual.",
                "positive_factors": [],
                "negative_factors": ["Error en análisis automático"],
                "estimated_approval_time": "24-48 horas",
                "can_create_church": False
            }
    
    @classmethod
    def _analyze_email(cls, email: str) -> tuple[float, List[str]]:
        """Analiza el email del usuario (max 0.3 puntos)"""
        score = 0.0
        factors = []
        
        if not email:
            return 0.0, []
        
        email_lower = email.lower()
        domain = email_lower.split('@')[-1] if '@' in email_lower else ''
        
        # Email de dominio de iglesia (+0.3)
        if any(church_domain in domain for church_domain in cls.CHURCH_DOMAINS):
            score += 0.3
            factors.append("Email de dominio institucional de iglesia")
        # Email corporativo no genérico (+0.2)
        elif domain not in ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']:
            score += 0.2
            factors.append("Email de dominio personalizado")
        # Email genérico pero bien formado (+0.1)
        else:
            score += 0.1
            factors.append("Email válido")
        
        # Verificar si el email contiene palabras relacionadas con iglesia
        if any(word in email_lower for word in ['pastor', 'iglesia', 'church', 'ministerio']):
            score += 0.05
            factors.append("Email contiene términos religiosos")
        
        return score, factors
    
    @classmethod
    def _analyze_pastoral_info(cls, pastor_info: Dict[str, Any]) -> tuple[float, List[str]]:
        """Analiza información pastoral (max 0.4 puntos)"""
        score = 0.0
        factors = []
        
        # Denominación reconocida (+0.15)
        denomination = pastor_info.get('denomination', '').lower()
        if any(denom in denomination for denom in cls.RECOGNIZED_DENOMINATIONS):
            score += 0.15
            factors.append(f"Denominación reconocida: {pastor_info.get('denomination')}")
        elif denomination:
            score += 0.05
            factors.append("Denominación proporcionada")
        
        # Años de experiencia (+0.15)
        years = pastor_info.get('years_in_ministry', 0)
        if years >= 10:
            score += 0.15
            factors.append(f"Amplia experiencia ministerial ({years} años)")
        elif years >= 5:
            score += 0.10
            factors.append(f"Experiencia ministerial significativa ({years} años)")
        elif years >= 1:
            score += 0.05
            factors.append(f"Experiencia ministerial ({years} años)")
        
        # Iglesia actual mencionada (+0.10)
        if pastor_info.get('current_church_name'):
            score += 0.10
            factors.append("Iglesia actual identificada")
        
        return score, factors
    
    @classmethod
    def _analyze_documentation(cls, pastor_info: Dict[str, Any]) -> tuple[float, List[str]]:
        """Analiza documentación adjunta (max 0.3 puntos)"""
        score = 0.0
        factors = []
        
        # Certificado de ordenación (+0.20)
        if pastor_info.get('ordination_certificate_url'):
            score += 0.20
            factors.append("Certificado de ordenación proporcionado")
        
        # Carta de referencia (+0.10)
        if pastor_info.get('reference_letter_url'):
            score += 0.10
            factors.append("Carta de referencia adjunta")
        
        return score, factors
    
    @classmethod
    def _make_decision(cls, score: float, positive_factors: List[str], negative_factors: List[str]) -> tuple[str, str, str]:
        """
        Toma la decisión final basada en el score
        
        Returns:
            (decision, message, estimated_time)
        """
        if score >= 0.75:
            return (
                "auto_approve",
                "¡Excelente! Tu solicitud ha sido aprobada automáticamente. Ya puedes registrar tu iglesia.",
                "Inmediato"
            )
        elif score >= 0.50:
            return (
                "manual_review",
                "Tu solicitud está en revisión manual. Nuestro equipo la verificará pronto.",
                "24-48 horas"
            )
        else:
            return (
                "request_more_info",
                "Necesitamos más información para aprobar tu solicitud. Por favor, completa tu perfil.",
                "Pendiente de información adicional"
            )