# app/api/v1/auth/endpoints.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
from datetime import datetime

from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.database.models.user import UserModel, UserRole, UserStatus
from app.infrastructure.database.models.church import ChurchModel
from app.api.v1.auth.schemas import (
    UserRegisterRequest, UserLoginRequest, AuthResponse, RegisterResponse,
    UserResponse, RefreshTokenRequest, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
)
from app.api.v1.auth.dependencies import get_current_user, get_current_active_user
from app.api.v1.auth.approval_service import UserApprovalService
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, verify_token
)

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Registrar un nuevo usuario
    
    Tipos de registro:
    - pastor_new_church: Pastor que registrará una nueva iglesia
    - staff_existing_church: Staff que se unirá a una iglesia existente
    - member: Miembro regular (futuro)
    """
    try:
        logger.info(f"📝 Registration request: {request.email} - Type: {request.registration_type}")
        
        repository = UserRepository(db)
        
        # 1. Verificar que el email no exista
        existing_user = await repository.find_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este email ya está registrado"
            )
        
        # 2. Determinar rol según tipo de registro
        if request.registration_type == "pastor_new_church":
            role = UserRole.PASTOR_PRINCIPAL
        elif request.registration_type == "staff_existing_church":
            role = request.requested_role or UserRole.VOLUNTARIO
        else:
            role = UserRole.MIEMBRO
        
        # 3. Verificar código de iglesia si es staff
        pending_church_id = None
        if request.registration_type == "staff_existing_church":
            stmt = select(ChurchModel).where(
                ChurchModel.invitation_code == request.church_invitation_code
            )
            result = await db.execute(stmt)
            church = result.scalar_one_or_none()
            
            if not church:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Código de iglesia inválido"
                )
            pending_church_id = church.id
        
        # 4. Crear usuario
        pastor_info_dict = None
        if request.pastor_info:
            pastor_info_dict = request.pastor_info.dict()
        
        user = await repository.create_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            role=role,
            registration_type=request.registration_type,
            pastor_info=pastor_info_dict,
            pending_church_id=pending_church_id
        )
        
        # 5. Evaluación con IA (solo para pastores)
        ai_assessment = None
        if request.registration_type == "pastor_new_church":
            assessment_data = {
                "email": request.email,
                "first_name": request.first_name,
                "last_name": request.last_name,
                "pastor_info": pastor_info_dict or {}
            }
            
            ai_assessment = UserApprovalService.assess_pastor_registration(assessment_data)
            
            # Actualizar estado según evaluación IA
            new_status = UserStatus.ACTIVE if ai_assessment["decision"] == "auto_approve" else UserStatus.PENDING_APPROVAL
            
            await repository.update_approval_status(
                user=user,
                status=new_status,
                ai_score=ai_assessment["score"],
                ai_notes=ai_assessment,
                can_create_church=ai_assessment["can_create_church"]
            )
        else:
            # Staff y miembros van directo a revisión
            ai_assessment = {
                "score": 0.5,
                "message": "Pendiente de aprobación por el pastor",
                "estimated_approval_time": "Pendiente de aprobación del pastor"
            }
        
        # 6. Crear tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"✅ User registered: {user.id} - Status: {user.status}")
        
        return RegisterResponse(
            success=True,
            message=ai_assessment.get("message", "Usuario registrado exitosamente"),
            user_id=str(user.id),
            status=user.status,
            can_create_church=user.can_create_church,
            ai_score=ai_assessment.get("score"),
            estimated_approval_time=ai_assessment.get("estimated_approval_time"),
            access_token=access_token,
            refresh_token=refresh_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar usuario"
        )

@router.post("/login", response_model=AuthResponse)
async def login(
    request: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login de usuario"""
    try:
        logger.info(f"🔐 Login attempt: {request.email}")
        
        repository = UserRepository(db)
        
        # 1. Buscar usuario
        user = await repository.find_by_email(request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # 2. Verificar contraseña
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # 3. Actualizar último login
        await repository.update_last_login(user)
        
        # 4. Crear tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"✅ Login successful: {user.id}")
        
        return AuthResponse(
            success=True,
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role,
                status=user.status,
                can_create_church=user.can_create_church,
                has_church=user.has_church,
                church_id=str(user.church_id) if user.church_id else None,
                is_email_verified=user.is_email_verified,
                ai_approval_score=user.ai_approval_score
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al iniciar sesión"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        status=current_user.status,
        can_create_church=current_user.can_create_church,
        has_church=current_user.has_church,
        church_id=str(current_user.church_id) if current_user.church_id else None,
        is_email_verified=current_user.is_email_verified,
        ai_approval_score=current_user.ai_approval_score
    )

@router.post("/refresh")
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Refrescar access token usando refresh token"""
    try:
        # Verificar refresh token
        payload = verify_token(request.refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de refresco inválido"
            )
        
        user_id = payload.get("sub")
        repository = UserRepository(db)
        user = await repository.find_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        # Crear nuevo access token
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        new_access_token = create_access_token(token_data)
        
        return {
            "success": True,
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Refresh token error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error al refrescar token"
        )

@router.post("/logout")
async def logout(
    current_user: UserModel = Depends(get_current_user)
):
    """Logout (en frontend borrar tokens)"""
    logger.info(f"👋 User logged out: {current_user.id}")
    return {
        "success": True,
        "message": "Sesión cerrada exitosamente"
    }

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cambiar contraseña del usuario actual"""
    try:
        # Verificar contraseña actual
        if not verify_password(request.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contraseña actual incorrecta"
            )
        
        # Actualizar contraseña
        current_user.password_hash = get_password_hash(request.new_password)
        current_user.updated_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info(f"🔒 Password changed for user: {current_user.id}")
        
        return {
            "success": True,
            "message": "Contraseña actualizada exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Change password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar contraseña"
        )

@router.post("/verify-email")
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verificar email usando token"""
    try:
        repository = UserRepository(db)
        user = await repository.verify_email(request.token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de verificación inválido o expirado"
            )
        
        logger.info(f"✅ Email verified: {user.email}")
        
        return {
            "success": True,
            "message": "Email verificado exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al verificar email"
        )

@router.get("/health")
async def auth_health():
    """Health check del módulo de autenticación"""
    return {
        "status": "healthy",
        "module": "Authentication",
        "version": "1.0.0",
        "endpoints": {
            "POST /register": "Registrar nuevo usuario",
            "POST /login": "Iniciar sesión",
            "GET /me": "Obtener usuario actual",
            "POST /refresh": "Refrescar token",
            "POST /logout": "Cerrar sesión",
            "POST /change-password": "Cambiar contraseña",
            "POST /verify-email": "Verificar email"
        }
    }