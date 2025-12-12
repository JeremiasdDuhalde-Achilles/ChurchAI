from fastapi import APIRouter

# Crear el router principal de v1
api_router = APIRouter()

# NOTA: members_import comentado hasta resolver dependencias
# from app.api.v1.endpoints import members_import
# api_router.include_router(
#     members_import.router,
#     prefix="/members",
#     tags=["members"]
# )
