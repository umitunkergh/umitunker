from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from models import SearchRequest, SearchResponse, SearchHistory
from ai_service import AIService
from admin_routes import create_admin_router
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="UU AI Sales Dictionary API",
    description="AI-powered Turkish/English sales terminology dictionary",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize AI Service
ai_service = AIService()

# Create admin router
admin_router = create_admin_router(db)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "UU AI Satış Sözlüğü API is running"}


@api_router.post("/search", response_model=SearchResponse)
async def search_sales_question(request: SearchRequest):
    """
    Process sales questions using AI and return structured answers
    """
    try:
        # Get AI response
        ai_response = await ai_service.get_sales_answer(request.question, request.sessionId)
        
        # Detect language
        language = ai_service.detect_language(request.question)
        
        # Create response object
        response = SearchResponse(
            sessionId=request.sessionId,
            question=request.question,
            answer=ai_response['answer'],
            examples=ai_response['examples'],
            relatedTerms=ai_response['relatedTerms'],
            language=language,
            timestamp=datetime.utcnow()
        )
        
        # Save to database
        search_history = SearchHistory(
            sessionId=request.sessionId,
            question=request.question,
            answer=ai_response['answer'],
            examples=ai_response['examples'],
            relatedTerms=ai_response['relatedTerms'],
            language=language,
            timestamp=datetime.utcnow(),
            createdAt=datetime.utcnow()
        )
        
        await db.search_history.insert_one(search_history.model_dump())
        
        return response
        
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Arama işlemi sırasında bir hata oluştu: {str(e)}")


@api_router.get("/search/recent/{session_id}", response_model=List[SearchHistory])
async def get_recent_searches(session_id: str, limit: int = 10):
    """
    Get recent search history for a session
    """
    try:
        cursor = db.search_history.find(
            {"sessionId": session_id}
        ).sort("createdAt", -1).limit(limit)
        
        search_history = await cursor.to_list(length=limit)

        result = []
        for search in search_history:
            search.pop('_id', None)
            result.append(SearchHistory(**search))
        return result
        
    except Exception as e:
        logging.error(f"Recent search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Son aramalar getirilirken bir hata oluştu")


@api_router.get("/search/popular", response_model=List[dict])
async def get_popular_searches(limit: int = 10):
    """
    Get most popular search terms
    """
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$question",
                    "count": {"$sum": 1},
                    "lastSearched": {"$max": "$createdAt"}
                }
            },
            {
                "$sort": {"count": -1, "lastSearched": -1}
            },
            {
                "$limit": limit
            }
        ]
        
        popular_searches = await db.search_history.aggregate(pipeline).to_list(length=limit)
        
        return [
            {
                "question": search["_id"],
                "count": search["count"],
                "lastSearched": search["lastSearched"]
            }
            for search in popular_searches
        ]
        
    except Exception as e:
        logging.error(f"Popular search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Popüler aramalar getirilirken bir hata oluştu")


# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()