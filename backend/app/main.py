# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import structlog

# Import routers
from app.api.v1.auth.endpoints import router as auth_router
from app.api.v1.church.endpoints import router as church_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting ChurchAI API")
    yield
    # Shutdown
    logger.info("🛑 Shutting down ChurchAI API")

# Create FastAPI app
app = FastAPI(
    title="ChurchAI API",
    description="The first AI-powered church management platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar por dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to ChurchAI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "modules": {
            "authentication": "/api/v1/auth",
            "churches": "/api/v1/churches"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ChurchAI API",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Include API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(church_router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# Members endpoints
from app.api.v1.endpoints import members
app.include_router(members.router, prefix="/api/v1", tags=["members"])

from app.api.v1.endpoints import members
app.include_router(members.router, prefix="/api/v1", tags=["members"])

