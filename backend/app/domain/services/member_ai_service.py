# app/domain/services/member_ai_service.py
from typing import Dict, List, Optional
from datetime import date, timedelta
from app.infrastructure.database.models.member import MemberModel, AttendanceRecordModel


class MemberAIService:
    """Servicio de IA para análisis y recomendaciones de miembros"""
    
    @staticmethod
    def calculate_commitment_score(
        member: MemberModel,
        attendance_records: List[AttendanceRecordModel] = None
    ) -> float:
        """
        Calcula el score de compromiso del miembro (0-100)
        
        Factores:
        - Asistencia (40%)
        - Participación en ministerios (30%)
        - Actividad reciente (20%)
        - Compromiso financiero/servicio (10%)
        """
        score = 0.0
        
        # 1. Asistencia (40 puntos)
        attendance_rate = member.attendance_rate or 0
        if attendance_rate >= 80:
            score += 40
        elif attendance_rate >= 60:
            score += 30
        elif attendance_rate >= 40:
            score += 20
        elif attendance_rate >= 20:
            score += 10
        
        # 2. Participación ministerial (30 puntos)
        ministries_count = len(member.ministries or [])
        if ministries_count >= 2:
            score += 30
        elif ministries_count == 1:
            score += 20
        elif member.small_group_id:
            score += 10
        
        # 3. Actividad reciente (20 puntos)
        if member.last_attendance:
            days_since_last = (date.today() - member.last_attendance).days
            if days_since_last < 7:
                score += 20
            elif days_since_last < 14:
                score += 15
            elif days_since_last < 21:
                score += 10
            elif days_since_last < 30:
                score += 5
        
        # 4. Engagement adicional (10 puntos)
        # Tiene dones espirituales identificados
        if member.spiritual_gifts and len(member.spiritual_gifts) > 0:
            score += 5
        
        # Es líder en grupo pequeño
        if member.small_group_role in ['lider', 'anfitrion']:
            score += 5
        
        return min(100.0, score)
    
    @staticmethod
    def detect_abandonment_risk(member: MemberModel) -> Dict:
        """
        Detecta el riesgo de abandono del miembro
        
        Returns:
            {
                "level": "bajo|medio|alto|critico",
                "score": 0-100,
                "factors": [lista de factores],
                "recommendation": "descripción"
            }
        """
        risk_factors = []
        risk_score = 0
        
        # Factor 1: Ausencia prolongada
        if member.last_attendance:
            days_since_last = (date.today() - member.last_attendance).days
            
            if days_since_last > 60:
                risk_factors.append("ausencia_critica_60_dias")
                risk_score += 35
            elif days_since_last > 30:
                risk_factors.append("ausencia_prolongada_30_dias")
                risk_score += 25
            elif days_since_last > 21:
                risk_factors.append("ausencia_21_dias")
                risk_score += 15
            elif days_since_last > 14:
                risk_factors.append("ausencia_14_dias")
                risk_score += 10
        else:
            risk_factors.append("sin_registro_asistencia")
            risk_score += 20
        
        # Factor 2: Baja asistencia
        attendance_rate = member.attendance_rate or 0
        if attendance_rate < 20:
            risk_factors.append("asistencia_muy_baja")
            risk_score += 25
        elif attendance_rate < 40:
            risk_factors.append("asistencia_baja")
            risk_score += 15
        elif attendance_rate < 60:
            risk_factors.append("asistencia_irregular")
            risk_score += 10
        
        # Factor 3: Sin participación ministerial
        if not member.ministries or len(member.ministries) == 0:
            risk_factors.append("sin_participacion_ministerial")
            risk_score += 15
        
        # Factor 4: Sin grupo pequeño
        if not member.small_group_id:
            risk_factors.append("sin_grupo_pequeno")
            risk_score += 10
        
        # Factor 5: Caída en compromiso
        if member.commitment_score < 30:
            risk_factors.append("compromiso_muy_bajo")
            risk_score += 15
        elif member.commitment_score < 50:
            risk_factors.append("compromiso_bajo")
            risk_score += 10
        
        # Factor 6: Visitante de largo plazo sin activarse
        if member.member_type == "visitante":
            if member.membership_date:
                days_as_visitor = (date.today() - member.membership_date).days
                if days_as_visitor > 90:
                    risk_factors.append("visitante_estancado")
                    risk_score += 15
        
        # Determinar nivel de riesgo
        if risk_score >= 70:
            level = "critico"
        elif risk_score >= 50:
            level = "alto"
        elif risk_score >= 30:
            level = "medio"
        else:
            level = "bajo"
        
        # Generar recomendación
        recommendation = MemberAIService._generate_risk_recommendation(level, risk_factors)
        
        return {
            "level": level,
            "score": min(100, risk_score),
            "factors": risk_factors,
            "recommendation": recommendation
        }
    
    @staticmethod
    def _generate_risk_recommendation(level: str, factors: List[str]) -> str:
        """Genera recomendación basada en nivel de riesgo"""
        recommendations = {
            "critico": "ACCIÓN URGENTE: Visita pastoral inmediata requerida. El miembro está en alto riesgo de abandono.",
            "alto": "PRIORIDAD ALTA: Contacto personal esta semana. Considerar visita o reunión individual.",
            "medio": "Seguimiento recomendado: Llamada telefónica o mensaje personalizado en los próximos 7 días.",
            "bajo": "Seguimiento regular: Incluir en comunicaciones generales y monitorear evolución."
        }
        
        return recommendations.get(level, "Mantener seguimiento regular")
    
    @staticmethod
    def generate_followup_recommendations(member: MemberModel) -> List[Dict]:
        """
        Genera recomendaciones de seguimiento personalizadas
        
        Returns:
            Lista de acciones recomendadas con prioridad
        """
        recommendations = []
        
        # 1. Cumpleaños próximo
        if member.birth_date:
            days_to_birthday = MemberAIService._days_until_next_birthday(member.birth_date)
            if 0 <= days_to_birthday <= 7:
                recommendations.append({
                    "action": "Enviar felicitación de cumpleaños",
                    "priority": "alta",
                    "channel": member.preferred_contact_method,
                    "reason": f"Cumpleaños en {days_to_birthday} días",
                    "template": "birthday_greeting"
                })
        
        # 2. Ausencia prolongada
        if member.last_attendance:
            days_since_last = (date.today() - member.last_attendance).days
            
            if days_since_last > 30:
                recommendations.append({
                    "action": "Visita pastoral urgente",
                    "priority": "critica",
                    "channel": "visit",
                    "reason": f"Sin asistencia hace {days_since_last} días",
                    "template": None
                })
            elif days_since_last > 21:
                recommendations.append({
                    "action": "Llamada de seguimiento",
                    "priority": "alta",
                    "channel": "phone",
                    "reason": f"Ausencia de {days_since_last} días",
                    "template": "followup_call"
                })
        
        # 3. Nuevo miembro sin integración
        if member.member_type == "visitante" and member.membership_date:
            days_as_member = (date.today() - member.membership_date).days
            
            if 7 <= days_as_member <= 30 and not member.small_group_id:
                recommendations.append({
                    "action": "Invitar a grupo pequeño",
                    "priority": "alta",
                    "channel": member.preferred_contact_method,
                    "reason": "Nuevo miembro sin grupo asignado",
                    "template": "small_group_invitation"
                })
        
        # 4. Sin ministerio pero con dones identificados
        if (member.spiritual_gifts and len(member.spiritual_gifts) > 0 and
            (not member.ministries or len(member.ministries) == 0)):
            recommendations.append({
                "action": "Proponer ministerio según dones",
                "priority": "media",
                "channel": "meeting",
                "reason": f"Tiene dones: {', '.join(member.spiritual_gifts[:2])}",
                "template": "ministry_invitation"
            })
        
        # 5. Aniversario de membresía
        if member.membership_date and member.member_type == "activo":
            days_since_membership = (date.today() - member.membership_date).days
            years = days_since_membership // 365
            days_to_anniversary = 365 - (days_since_membership % 365)
            
            if years > 0 and days_to_anniversary <= 7:
                recommendations.append({
                    "action": f"Celebrar {years} años de membresía",
                    "priority": "media",
                    "channel": "public_recognition",
                    "reason": f"Aniversario de {years} años",
                    "template": "membership_anniversary"
                })
        
        # 6. Seguimiento post-nota pastoral
        # Si tiene notas recientes con follow_up_date próximo
        # (esto requeriría acceso a las notas, se puede agregar después)
        
        # 7. Baja participación pero buen historial
        if member.commitment_score < 50 and member.attendance_rate > 70:
            recommendations.append({
                "action": "Conversar sobre participación ministerial",
                "priority": "media",
                "channel": "meeting",
                "reason": "Buena asistencia pero baja participación",
                "template": "ministry_conversation"
            })
        
        # Ordenar por prioridad
        priority_order = {"critica": 0, "alta": 1, "media": 2, "baja": 3}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 4))
        
        return recommendations
    
    @staticmethod
    def _days_until_next_birthday(birth_date: date) -> int:
        """Calcula días hasta el próximo cumpleaños"""
        today = date.today()
        next_birthday = date(today.year, birth_date.month, birth_date.day)
        
        if next_birthday < today:
            next_birthday = date(today.year + 1, birth_date.month, birth_date.day)
        
        return (next_birthday - today).days
    
    @staticmethod
    def suggest_ministry_assignments(member: MemberModel) -> List[Dict]:
        """
        Sugiere ministerios basados en dones, habilidades e intereses
        """
        suggestions = []
        
        if not member.spiritual_gifts:
            return suggestions
        
        # Mapeo de dones a ministerios
        gift_to_ministry = {
            "enseñanza": ["escuela_dominical", "jovenes", "discipulado"],
            "musica": ["alabanza", "coro", "banda"],
            "evangelismo": ["evangelismo", "visitacion", "redes_sociales"],
            "servicio": ["ujieres", "limpieza", "cocina", "mantenimiento"],
            "administracion": ["secretaria", "administracion", "finanzas"],
            "misericordia": ["visitacion_enfermos", "benevolencia", "consejeria"],
            "liderazgo": ["grupos_pequenos", "coordinacion", "jovenes"],
            "hospitalidad": ["recepcion", "nuevos_miembros", "eventos"],
            "intercesion": ["intercesion", "oracion", "vigilia"],
            "profecia": ["predicacion", "ensenanza", "consejeria"],
            "fe": ["misionero", "plantacion_iglesias", "oracion"],
            "sanidad": ["visitacion_enfermos", "oracion", "consejeria"]
        }
        
        for gift in member.spiritual_gifts:
            gift_lower = gift.lower()
            if gift_lower in gift_to_ministry:
                for ministry in gift_to_ministry[gift_lower]:
                    # Evitar sugerir ministerios donde ya participa
                    if not member.ministries or ministry not in [m.lower() for m in member.ministries]:
                        suggestions.append({
                            "ministry": ministry,
                            "reason": f"Don de {gift}",
                            "fit_score": 85
                        })
        
        # También considerar habilidades profesionales
        if member.skills:
            skill_to_ministry = {
                "diseño": ["redes_sociales", "creatividad", "comunicaciones"],
                "contabilidad": ["finanzas", "administracion"],
                "tecnologia": ["audiovisual", "redes_sociales", "streaming"],
                "cocina": ["cocina", "eventos"],
                "construccion": ["mantenimiento", "proyectos"],
                "educacion": ["escuela_dominical", "jovenes"]
            }
            
            for skill in member.skills:
                skill_lower = skill.lower()
                for key, ministries in skill_to_ministry.items():
                    if key in skill_lower:
                        for ministry in ministries:
                            if not member.ministries or ministry not in [m.lower() for m in member.ministries]:
                                suggestions.append({
                                    "ministry": ministry,
                                    "reason": f"Habilidad en {skill}",
                                    "fit_score": 75
                                })
        
        # Remover duplicados y ordenar por fit_score
        unique_suggestions = {}
        for sug in suggestions:
            if sug["ministry"] not in unique_suggestions:
                unique_suggestions[sug["ministry"]] = sug
        
        result = list(unique_suggestions.values())
        result.sort(key=lambda x: x["fit_score"], reverse=True)
        
        return result[:5]  # Top 5 sugerencias
    
    @staticmethod
    def analyze_member_trend(
        member: MemberModel,
        attendance_history: List[AttendanceRecordModel]
    ) -> Dict:
        """
        Analiza la tendencia del miembro en los últimos meses
        
        Returns:
            {
                "trend": "improving|stable|declining|critical",
                "attendance_trend": "up|stable|down",
                "commitment_change": float,  # % de cambio
                "prediction": "descripción"
            }
        """
        if not attendance_history or len(attendance_history) < 4:
            return {
                "trend": "insufficient_data",
                "attendance_trend": "unknown",
                "commitment_change": 0,
                "prediction": "Datos insuficientes para análisis de tendencia"
            }
        
        # Dividir en dos períodos: primeros 50% vs últimos 50%
        mid_point = len(attendance_history) // 2
        first_half = attendance_history[:mid_point]
        second_half = attendance_history[mid_point:]
        
        # Calcular tasas de asistencia
        first_half_rate = sum(1 for r in first_half if r.attended) / len(first_half) * 100
        second_half_rate = sum(1 for r in second_half if r.attended) / len(second_half) * 100
        
        change = second_half_rate - first_half_rate
        
        # Determinar tendencia
        if change > 15:
            trend = "improving"
            attendance_trend = "up"
            prediction = "Miembro mostrando mejora significativa en compromiso"
        elif change > 5:
            trend = "stable_positive"
            attendance_trend = "stable"
            prediction = "Miembro mantiene buen nivel de participación"
        elif change > -5:
            trend = "stable"
            attendance_trend = "stable"
            prediction = "Miembro mantiene nivel de participación consistente"
        elif change > -15:
            trend = "declining"
            attendance_trend = "down"
            prediction = "ALERTA: Miembro mostrando disminución en participación"
        else:
            trend = "critical"
            attendance_trend = "down"
            prediction = "CRÍTICO: Fuerte caída en participación - acción inmediata requerida"
        
        return {
            "trend": trend,
            "attendance_trend": attendance_trend,
            "commitment_change": round(change, 1),
            "prediction": prediction,
            "first_half_rate": round(first_half_rate, 1),
            "second_half_rate": round(second_half_rate, 1)
        }
    
    @staticmethod
    def generate_ai_insights(member: MemberModel) -> str:
        """
        Genera un análisis textual completo del miembro usando IA
        """
        insights = []
        
        # Análisis de compromiso
        commitment = member.commitment_score or 0
        if commitment >= 80:
            insights.append(f"✅ {member.first_name} demuestra un compromiso excepcional (score: {commitment:.0f}/100).")
        elif commitment >= 60:
            insights.append(f"👍 {member.first_name} mantiene buen nivel de compromiso (score: {commitment:.0f}/100).")
        elif commitment >= 40:
            insights.append(f"⚠️ {member.first_name} muestra compromiso moderado (score: {commitment:.0f}/100).")
        else:
            insights.append(f"🚨 {member.first_name} necesita atención urgente (score: {commitment:.0f}/100).")
        
        # Análisis de asistencia
        attendance = member.attendance_rate or 0
        if attendance >= 80:
            insights.append(f"Asistencia excelente ({attendance:.0f}%).")
        elif attendance >= 60:
            insights.append(f"Asistencia regular ({attendance:.0f}%).")
        elif attendance >= 40:
            insights.append(f"Asistencia irregular ({attendance:.0f}%).")
        else:
            insights.append(f"Asistencia baja ({attendance:.0f}%) - requiere seguimiento.")
        
        # Análisis de participación
        ministries_count = len(member.ministries or [])
        if ministries_count >= 2:
            insights.append(f"Activo en {ministries_count} ministerios: {', '.join(member.ministries[:3])}.")
        elif ministries_count == 1:
            insights.append(f"Participa en {member.ministries[0]}.")
        else:
            insights.append("No participa activamente en ministerios - oportunidad de integración.")
        
        # Análisis de riesgo
        risk = member.risk_level
        if risk in ["alto", "critico"]:
            insights.append(f"⚠️ RIESGO {risk.upper()} de abandono detectado.")
        
        # Tiempo en la iglesia
        if member.membership_date:
            days = (date.today() - member.membership_date).days
            years = days // 365
            months = (days % 365) // 30
            
            if years > 0:
                insights.append(f"Miembro hace {years} año{'s' if years > 1 else ''} y {months} meses.")
            else:
                insights.append(f"Miembro hace {months} meses - fase crítica de integración.")
        
        return " ".join(insights)