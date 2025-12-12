# app/api/v1/church/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

class AddressSchema(BaseModel):
    street: str = Field(..., min_length=1, max_length=500)
    number: str = Field(..., min_length=1, max_length=50)
    neighborhood: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=200)
    state: str = Field(..., min_length=1, max_length=200)
    postal_code: str = Field(..., min_length=1, max_length=50)
    country: str = Field(..., min_length=1, max_length=200)

class ContactInfoSchema(BaseModel):
    primary_email: EmailStr
    primary_phone: str = Field(..., min_length=5, max_length=50)
    secondary_email: Optional[EmailStr] = None
    whatsapp: Optional[str] = None

class LegalDocumentSchema(BaseModel):
    document_type: str = Field(default="legal_entity")
    document_number: str = Field(..., min_length=1, max_length=500)
    issued_date: str
    issuing_authority: str = Field(..., min_length=1, max_length=500)
    expiry_date: Optional[str] = None

class LegalDocumentationSchema(BaseModel):
    documents: List[LegalDocumentSchema]
    legal_representative_name: str = Field(..., min_length=1, max_length=500)
    legal_representative_id: str = Field(..., min_length=1, max_length=200)
    legal_representative_position: str = Field(default="Pastor Principal", max_length=200)
    registration_authority: str = Field(..., min_length=1, max_length=500)
    registration_number: str = Field(..., min_length=1, max_length=500)
    registration_date: str

class ChurchRegistrationRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    denomination: str = Field(..., min_length=1, max_length=500)
    address: AddressSchema
    contact_info: ContactInfoSchema
    legal_documentation: LegalDocumentationSchema
    organizational_structure: str = Field(default="traditional")
    estimated_size: str = Field(default="medium")
    founding_date: str
    website_url: Optional[str] = None
    social_media: Optional[Dict[str, str]] = None

    @validator('website_url')
    def validate_website_url(cls, v):
        if v and v.strip():
            if not (v.startswith('http://') or v.startswith('https://')):
                return f"https://{v}"
        return v

    @validator('legal_documentation')
    def validate_legal_docs(cls, v):
        if not v.documents:
            v.documents = [LegalDocumentSchema(
                document_type="legal_entity",
                document_number="AUTO-GENERATED-" + str(uuid.uuid4())[:8],
                issued_date=datetime.now().isoformat(),
                issuing_authority="Provided by user"
            )]
        return v

class ChurchRegistrationResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]