import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import connect_to_mongo, close_mongo_connection, init_db
import contextlib

logging.basicConfig(level=logging.INFO)

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await init_db()
    yield
    # Shutdown
    await close_mongo_connection()

from routes.auth import router as auth_router
from routes.courses import router as courses_router
from routes.recommendations import router as recommendations_router
from routes.interactions import router as interactions_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS configuration to allow requests from our React Vite app
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(recommendations_router)
app.include_router(interactions_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Learning Hub API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
