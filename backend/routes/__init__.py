from routes.auth_routes import router as auth_router
from routes.bike_routes import router as bike_router
from routes.expense_routes import router as expense_router
from routes.master_routes import router as master_router
from routes.document_routes import router as document_router

__all__ = ['auth_router', 'bike_router', 'expense_router', 'master_router', 'document_router']
