# app/api/v1/endpoints/members.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.infrastructure.repositories.member_repository import MemberRepository
from app.domain.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MemberListItem,
    MemberStats,
    ChurchMemberStats,
    MemberAIRecommendation,
    PastoralNoteCreate,
    PastoralNoteResponse,
    AttendanceRecordCreate,
    AttendanceRecordResponse
)
from app.domain.services.member_ai_service import MemberAIService
from app.api.v1.auth.dependencies import get_current_user
from app.infrastructure.database.models.user import UserModel

router = APIRouter(prefix="/members", tags=["members"])


# ==================== CRUD MEMBERS ====================

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    member_data: MemberCreate,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Crear nuevo miembro
    
    Requiere:
    - Usuario autenticado
    - Pertenecer a la iglesia donde se crea el miembro
    """
    # Verificar que el usuario pertenece a la iglesia
    if not current_user.church_id or str(current_user.church_id) != str(member_data.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para agregar miembros a esta iglesia"
        )
    
    repo = MemberRepository(session)
    
    # Verificar que el email no esté en uso
    if member_data.email:
        existing = await repo.get_by_email(member_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un miembro con este email"
            )
    
    # Crear miembro
    member = await repo.create(member_data, created_by=current_user.id)
    
    # Calcular scores iniciales
    member.commitment_score = MemberAIService.calculate_commitment_score(member)
    risk_analysis = MemberAIService.detect_abandonment_risk(member)
    member.risk_level = risk_analysis["level"]
    
    await session.commit()
    await session.refresh(member)
    
    return member


@router.get("/", response_model=List[MemberListItem])
async def get_members(
    member_type: Optional[str] = Query(None, description="Filtrar por tipo: activo, visitante, inactivo"),
    member_status: str = Query("active", description="Estado: active, inactive"),
    risk_level: Optional[str] = Query(None, description="Nivel de riesgo: bajo, medio, alto, critico"),
    search: Optional[str] = Query(None, description="Buscar por nombre, email o teléfono"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Obtener lista de miembros de la iglesia del usuario actual
    
    Filtros disponibles:
    - member_type: activo, visitante, inactivo
    - member_status: active, inactive
    - risk_level: bajo, medio, alto, critico
    - search: busca en nombre, email, teléfono
    """
    if not current_user.church_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no pertenece a ninguna iglesia"
        )
    
    repo = MemberRepository(session)
    
    if search:
        members = await repo.search_members(current_user.church_id, search, limit=limit)
    else:
        members = await repo.get_all_by_church(
            church_id=current_user.church_id,
            member_type=member_type,
            member_status=member_status,
            risk_level=risk_level,
            skip=skip,
            limit=limit
        )
    
    return members


@router.get("/stats", response_model=ChurchMemberStats)
async def get_church_member_stats(
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener estadísticas generales de miembros de la iglesia"""
    if not current_user.church_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no pertenece a ninguna iglesia"
        )
    
    repo = MemberRepository(session)
    stats = await repo.get_church_stats(current_user.church_id)
    
    return stats


@router.get("/at-risk", response_model=List[MemberListItem])
async def get_members_at_risk(
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener miembros con alto riesgo de abandono"""
    if not current_user.church_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no pertenece a ninguna iglesia"
        )
    
    repo = MemberRepository(session)
    members = await repo.get_members_at_risk(current_user.church_id)
    
    return members


@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener información completa de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    # Verificar que pertenece a la iglesia del usuario
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este miembro"
        )
    
    return member


@router.put("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: UUID,
    member_data: MemberUpdate,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Actualizar información de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar este miembro"
        )
    
    updated_member = await repo.update(member_id, member_data)
    
    # Recalcular scores si cambió algo relevante
    if any([member_data.ministries, member_data.member_type]):
        updated_member.commitment_score = MemberAIService.calculate_commitment_score(updated_member)
        risk_analysis = MemberAIService.detect_abandonment_risk(updated_member)
        updated_member.risk_level = risk_analysis["level"]
        await session.commit()
        await session.refresh(updated_member)
    
    return updated_member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Eliminar (desactivar) un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este miembro"
        )
    
    await repo.delete(member_id)
    return None


# ==================== IA Y ANALYTICS ====================

@router.get("/{member_id}/ai-insights", response_model=dict)
async def get_member_ai_insights(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener insights de IA sobre un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este miembro"
        )
    
    # Generar insights
    risk_analysis = MemberAIService.detect_abandonment_risk(member)
    insights_text = MemberAIService.generate_ai_insights(member)
    ministry_suggestions = MemberAIService.suggest_ministry_assignments(member)
    
    return {
        "member_id": member_id,
        "commitment_score": member.commitment_score,
        "attendance_rate": member.attendance_rate,
        "risk_analysis": risk_analysis,
        "insights": insights_text,
        "ministry_suggestions": ministry_suggestions
    }


@router.get("/{member_id}/recommendations", response_model=dict)
async def get_member_recommendations(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener recomendaciones de seguimiento para un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este miembro"
        )
    
    recommendations = MemberAIService.generate_followup_recommendations(member)
    risk_analysis = MemberAIService.detect_abandonment_risk(member)
    
    return {
        "member_id": member_id,
        "member_name": f"{member.first_name} {member.last_name}",
        "risk_level": risk_analysis["level"],
        "risk_score": risk_analysis["score"],
        "risk_factors": risk_analysis["factors"],
        "recommended_actions": recommendations,
        "ai_recommendation": risk_analysis["recommendation"]
    }


@router.post("/{member_id}/recalculate", response_model=MemberResponse)
async def recalculate_member_scores(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Recalcular todos los scores y análisis de IA de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este miembro"
        )
    
    # Recalcular attendance rate
    await repo.recalculate_attendance_rate(member_id)
    
    # Refrescar member
    await session.refresh(member)
    
    # Recalcular commitment score
    member.commitment_score = MemberAIService.calculate_commitment_score(member)
    
    # Recalcular risk level
    risk_analysis = MemberAIService.detect_abandonment_risk(member)
    member.risk_level = risk_analysis["level"]
    
    # Generar AI notes
    member.ai_notes = {
        "last_analysis": str(date.today()),
        "risk_analysis": risk_analysis,
        "insights": MemberAIService.generate_ai_insights(member)
    }
    
    await session.commit()
    await session.refresh(member)
    
    return member


# ==================== PASTORAL NOTES ====================

@router.post("/{member_id}/notes", response_model=PastoralNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_pastoral_note(
    member_id: UUID,
    note_data: PastoralNoteCreate,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Crear nota pastoral sobre un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para agregar notas a este miembro"
        )
    
    # Asegurar que member_id coincida
    note_data.member_id = member_id
    
    note = await repo.create_note(note_data, pastor_id=current_user.id)
    
    return note


@router.get("/{member_id}/notes", response_model=List[PastoralNoteResponse])
async def get_member_notes(
    member_id: UUID,
    include_private: bool = Query(True),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener notas pastorales de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver las notas de este miembro"
        )
    
    notes = await repo.get_member_notes(member_id, include_private=include_private)
    
    return notes


# ==================== ATTENDANCE ====================

@router.post("/{member_id}/attendance", response_model=AttendanceRecordResponse, status_code=status.HTTP_201_CREATED)
async def record_attendance(
    member_id: UUID,
    attendance_data: AttendanceRecordCreate,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Registrar asistencia de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para registrar asistencia para este miembro"
        )
    
    # Asegurar IDs correctos
    attendance_data.member_id = member_id
    attendance_data.church_id = current_user.church_id
    
    record = await repo.record_attendance(attendance_data)
    
    return record


@router.get("/{member_id}/attendance", response_model=List[AttendanceRecordResponse])
async def get_member_attendance(
    member_id: UUID,
    limit: int = Query(50, ge=1, le=500),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Obtener historial de asistencia de un miembro"""
    repo = MemberRepository(session)
    member = await repo.get_by_id(member_id)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Miembro no encontrado"
        )
    
    if str(member.church_id) != str(current_user.church_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver la asistencia de este miembro"
        )
    
    # Obtener registros de asistencia
    attendance_records = member.attendance_records[-limit:] if member.attendance_records else []
    
    return attendance_records


from datetime import date

# ==================== HISTORIAL DE CAMBIOS ====================

@router.get("/{member_id}/history")
async def get_member_history(
    member_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Obtener historial de cambios de un miembro
    
    Retorna lista de todos los cambios realizados en el miembro,
    ordenados del más reciente al más antiguo.
    """
    from sqlalchemy import text
    
    query = text("""
        SELECT 
            id::text as id,
            member_id::text as member_id,
            user_id::text as user_id,
            action,
            field_name,
            old_value,
            new_value,
            changed_at
        FROM member_audit_log
        WHERE member_id = :member_id
        ORDER BY changed_at DESC
        LIMIT 50
    """)
    
    result = await session.execute(query, {"member_id": str(member_id)})
    rows = result.fetchall()
    
    history = []
    for row in rows:
        history.append({
            "id": row.id,
            "member_id": row.member_id,
            "user_id": row.user_id,
            "action": row.action,
            "field_name": row.field_name,
            "old_value": row.old_value,
            "new_value": row.new_value,
            "changed_at": row.changed_at.isoformat() if row.changed_at else None,
            "user_name": None
        })
    
    return history
