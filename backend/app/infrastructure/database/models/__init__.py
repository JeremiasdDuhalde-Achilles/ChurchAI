from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Importar todos los modelos aquí para que Alembic los detecte
from app.infrastructure.database.models.user import UserModel, UserApprovalLogModel, UserRole, UserStatus, RegistrationType
from app.infrastructure.database.models.church import ChurchModel, AddressModel, ContactInfoModel, LegalDocumentModel

__all__ = [
    "Base",
    "UserModel",
    "UserApprovalLogModel",
    "UserRole",
    "UserStatus",
    "RegistrationType",
    "ChurchModel",
    "AddressModel",
    "ContactInfoModel",
    "LegalDocumentModel",
]