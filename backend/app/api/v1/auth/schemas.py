# app/api/v1/auth/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime

# Información de pastor para registro
class PastorInfo(BaseModel):
    denomination: str = Field(..., min_length=2, max_length=200)
    years_in_ministry: int = Field(..., ge=0, le=100)
    current_church_name: Optional[str] = Field(None, max_length=500)
    ordination_certificate_url: Optional[str] = None
    reference_letter_url: Optional[str] = None

# Registro de usuario
class UserRegisterRequest(BaseModel):
    registration_type: str = Field(..., description="pastor_new_church, staff_existing_church, member")
    
    # Datos básicos
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    
    # Información de pastor (requerido si registration_type = pastor_new_church)
    pastor_info: Optional[PastorInfo] = None
    
    # Para unirse a iglesia existente
    church_invitation_code: Optional[str] = Field(None, max_length=20)
    requested_role: Optional[str] = None
    
    @validator('registration_type')
    def validate_registration_type(cls, v):
        valid_types = ['pastor_new_church', 'staff_existing_church', 'member']
        if v not in valid_types:
            raise ValueError(f'registration_type debe ser uno de: {", ".join(valid_types)}')
        return v
    
    @validator('pastor_info')
    def validate_pastor_info(cls, v, values):
        if values.get('registration_type') == 'pastor_new_church' and not v:
            raise ValueError('pastor_info es requerido para registro de pastor')
        return v
    
    @validator('church_invitation_code')
    def validate_church_code(cls, v, values):
        if values.get('registration_type') == 'staff_existing_church' and not v:
            raise ValueError('church_invitation_code es requerido para unirse a iglesia existente')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

# Login
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Respuesta de autenticación
class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    status: str
    can_create_church: bool
    has_church: bool
    church_id: Optional[str]
    is_email_verified: bool
    ai_approval_score: Optional[float]
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    success: bool
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    status: str
    can_create_church: bool
    ai_score: Optional[float]
    estimated_approval_time: Optional[str]
    access_token: str
    refresh_token: str

# Token refresh
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Cambio de contraseña
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

# Recuperar contraseña
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

# Verificación de email
class VerifyEmailRequest(BaseModel):
    token: str