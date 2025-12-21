from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging

from config.database import close_db_connection
from routes import auth_router, bike_router, expense_router, master_router, document_router

# Create the main app
app = FastAPI(
    title="mTorq Bike Management API",
    description="API for managing bikes and tracking expenses",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(bike_router)
api_router.include_router(expense_router)
api_router.include_router(master_router)
api_router.include_router(document_router)

# Include the main router
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "mTorq Bike Management API"}


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_connection()