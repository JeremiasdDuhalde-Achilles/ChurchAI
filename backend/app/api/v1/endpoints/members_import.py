# app/api/v1/endpoints/members_import.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from uuid import UUID
import pandas as pd
import io
from datetime import datetime

from app.infrastructure.database.connection import get_db
from app.infrastructure.repositories.member_repository import MemberRepository
from app.domain.schemas.member import MemberCreate
from app.domain.services.member_ai_service import MemberAIService
from app.api.v1.auth.dependencies import get_current_user
from app.infrastructure.database.models.user import UserModel

router = APIRouter(prefix="/members", tags=["members"])


@router.post("/import", response_model=Dict[str, Any])
async def import_members(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Importar miembros desde archivo Excel o CSV
    
    El archivo debe tener las siguientes columnas:
    - first_name (requerido)
    - last_name (requerido)
    - email
    - phone
    - birth_date (formato: YYYY-MM-DD)
    - gender (masculino/femenino)
    - marital_status (soltero/casado/divorciado/viudo)
    - member_type (activo/visitante/inactivo)
    - membership_date (formato: YYYY-MM-DD)
    - baptism_date (formato: YYYY-MM-DD)
    - preferred_contact_method (email/phone/whatsapp/in_person)
    """
    if not current_user.church_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no pertenece a ninguna iglesia"
        )
    
    # Validar tipo de archivo
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionó un archivo"
        )
    
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['xlsx', 'xls', 'csv']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de archivo no soportado. Use Excel (.xlsx, .xls) o CSV (.csv)"
        )
    
    try:
        # Leer archivo
        contents = await file.read()
        
        if file_ext == 'csv':
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Validar columnas requeridas
        required_columns = ['first_name', 'last_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Columnas requeridas faltantes: {', '.join(missing_columns)}"
            )
        
        # Limpiar datos
        df = df.fillna('')
        
        # Estadísticas de importación
        total_rows = len(df)
        imported = 0
        errors = []
        
        repo = MemberRepository(session)
        
        # Procesar cada fila
        for index, row in df.iterrows():
            try:
                # Convertir fechas
                birth_date = None
                if row.get('birth_date') and str(row['birth_date']).strip():
                    try:
                        birth_date = pd.to_datetime(row['birth_date']).date()
                    except:
                        pass
                
                membership_date = None
                if row.get('membership_date') and str(row['membership_date']).strip():
                    try:
                        membership_date = pd.to_datetime(row['membership_date']).date()
                    except:
                        pass
                
                baptism_date = None
                if row.get('baptism_date') and str(row['baptism_date']).strip():
                    try:
                        baptism_date = pd.to_datetime(row['baptism_date']).date()
                    except:
                        pass
                
                # Preparar datos del miembro
                member_data = MemberCreate(
                    church_id=current_user.church_id,
                    first_name=str(row['first_name']).strip(),
                    last_name=str(row['last_name']).strip(),
                    email=str(row.get('email', '')).strip() or None,
                    phone=str(row.get('phone', '')).strip() or None,
                    birth_date=birth_date,
                    gender=str(row.get('gender', '')).strip() or None,
                    marital_status=str(row.get('marital_status', '')).strip() or None,
                    member_type=str(row.get('member_type', 'activo')).strip(),
                    membership_date=membership_date,
                    baptism_date=baptism_date,
                    preferred_contact_method=str(row.get('preferred_contact_method', '')).strip() or None
                )
                
                # Validar que el email no exista (si se proporcionó)
                if member_data.email:
                    existing = await repo.get_by_email(member_data.email)
                    if existing:
                        errors.append({
                            'row': index + 2,  # +2 porque Excel empieza en 1 y tiene header
                            'name': f"{member_data.first_name} {member_data.last_name}",
                            'error': f"Email {member_data.email} ya existe"
                        })
                        continue
                
                # Crear miembro
                member = await repo.create(member_data, created_by=current_user.id)
                
                # Calcular scores iniciales
                member.commitment_score = MemberAIService.calculate_commitment_score(member)
                risk_analysis = MemberAIService.detect_abandonment_risk(member)
                member.risk_level = risk_analysis["level"]
                
                imported += 1
                
            except Exception as e:
                errors.append({
                    'row': index + 2,
                    'name': f"{row.get('first_name', '')} {row.get('last_name', '')}",
                    'error': str(e)
                })
        
        # Commit de todos los cambios
        await session.commit()
        
        # Preparar respuesta
        response = {
            'total_rows': total_rows,
            'imported': imported,
            'failed': len(errors),
            'errors': errors[:10],  # Solo mostrar primeros 10 errores
            'success': imported > 0
        }
        
        return response
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el archivo: {str(e)}"
        )


@router.get("/import/template")
async def download_import_template(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Descargar plantilla de Excel para importación
    """
    from fastapi.responses import StreamingResponse
    
    # Crear DataFrame con columnas de ejemplo
    template_data = {
        'first_name': ['Juan', 'María'],
        'last_name': ['Pérez', 'García'],
        'email': ['juan@example.com', 'maria@example.com'],
        'phone': ['+54 9 11 1234-5678', '+54 9 11 8765-4321'],
        'birth_date': ['1990-01-15', '1985-05-20'],
        'gender': ['masculino', 'femenino'],
        'marital_status': ['casado', 'soltera'],
        'member_type': ['activo', 'activo'],
        'membership_date': ['2020-01-01', '2021-06-15'],
        'baptism_date': ['2020-02-01', '2021-07-01'],
        'preferred_contact_method': ['email', 'whatsapp']
    }
    
    df = pd.DataFrame(template_data)
    
    # Crear archivo Excel en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Miembros')
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': 'attachment; filename=plantilla_importacion_miembros.xlsx'
        }
    )