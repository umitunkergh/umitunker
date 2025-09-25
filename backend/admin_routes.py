from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from admin_service import AdminService

def create_admin_router(db):
    admin_router = APIRouter(prefix="/admin", tags=["admin"])
    admin_service = AdminService(db)
    
    @admin_router.get("/dashboard/stats")
    async def get_dashboard_stats():
        """Get overall dashboard statistics"""
        try:
            stats = await admin_service.get_dashboard_stats()
            return stats
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dashboard istatistikleri alınamadı: {str(e)}")
    
    @admin_router.get("/analytics/trends")
    async def get_search_trends(days: int = Query(7, ge=1, le=90)):
        """Get search trends over specified days"""
        try:
            trends = await admin_service.get_search_trends(days)
            return {
                "trends": trends,
                "period_days": days
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Trend analizi alınamadı: {str(e)}")
    
    @admin_router.get("/analytics/popular")
    async def get_popular_questions(limit: int = Query(20, ge=1, le=100)):
        """Get most popular questions"""
        try:
            popular = await admin_service.get_popular_questions(limit)
            return {
                "popular_questions": popular,
                "limit": limit
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Popüler sorular alınamadı: {str(e)}")
    
    @admin_router.get("/analytics/languages")
    async def get_language_distribution():
        """Get language distribution of questions"""
        try:
            distribution = await admin_service.get_language_distribution()
            return {
                "language_distribution": distribution
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dil dağılımı alınamadı: {str(e)}")
    
    @admin_router.get("/sessions/activity")
    async def get_session_activity(limit: int = Query(50, ge=1, le=200)):
        """Get recent session activity"""
        try:
            activity = await admin_service.get_session_activity(limit)
            return {
                "session_activity": activity,
                "limit": limit
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Oturum aktivitesi alınamadı: {str(e)}")
    
    @admin_router.delete("/data/cleanup")
    async def cleanup_data(
        session_id: Optional[str] = Query(None, description="Specific session ID to delete"),
        older_than_days: Optional[int] = Query(None, ge=1, description="Delete data older than N days")
    ):
        """Delete search history based on criteria"""
        try:
            if not session_id and not older_than_days:
                raise HTTPException(status_code=400, detail="En az bir silme kriteri belirtmelisiniz")
            
            result = await admin_service.delete_search_history(session_id, older_than_days)
            
            if "error" in result:
                raise HTTPException(status_code=400, detail=result["error"])
            
            return {
                "message": "Veri temizleme başarılı",
                "deleted_count": result["deleted_count"],
                "criteria": result["criteria"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Veri temizleme hatası: {str(e)}")
    
    return admin_router