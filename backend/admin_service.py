import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from typing import Dict, List, Optional

load_dotenv()

class AdminService:
    def __init__(self, db):
        self.db = db
    
    async def get_dashboard_stats(self) -> Dict:
        """Get overall dashboard statistics"""
        try:
            # Total searches
            total_searches = await self.db.search_history.count_documents({})
            
            # Searches today
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            searches_today = await self.db.search_history.count_documents({
                "createdAt": {"$gte": today_start}
            })
            
            # Searches this week
            week_start = today_start - timedelta(days=7)
            searches_week = await self.db.search_history.count_documents({
                "createdAt": {"$gte": week_start}
            })
            
            # Unique sessions
            unique_sessions = len(await self.db.search_history.distinct("sessionId"))
            
            # Average searches per session
            avg_searches_per_session = total_searches / unique_sessions if unique_sessions > 0 else 0
            
            # Most active session
            pipeline = [
                {
                    "$group": {
                        "_id": "$sessionId",
                        "count": {"$sum": 1},
                        "lastActivity": {"$max": "$createdAt"}
                    }
                },
                {"$sort": {"count": -1}},
                {"$limit": 1}
            ]
            most_active = await self.db.search_history.aggregate(pipeline).to_list(length=1)
            most_active_count = most_active[0]["count"] if most_active else 0
            
            return {
                "totalSearches": total_searches,
                "searchesToday": searches_today,
                "searchesWeek": searches_week,
                "uniqueSessions": unique_sessions,
                "avgSearchesPerSession": round(avg_searches_per_session, 2),
                "mostActiveSessionCount": most_active_count,
                "lastUpdated": datetime.utcnow()
            }
            
        except Exception as e:
            print(f"Dashboard stats error: {str(e)}")
            return {
                "totalSearches": 0,
                "searchesToday": 0,
                "searchesWeek": 0,
                "uniqueSessions": 0,
                "avgSearchesPerSession": 0,
                "mostActiveSessionCount": 0,
                "lastUpdated": datetime.utcnow()
            }
    
    async def get_search_trends(self, days: int = 7) -> List[Dict]:
        """Get search trends over specified days"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "createdAt": {"$gte": start_date}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$createdAt"
                            }
                        },
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            trends = await self.db.search_history.aggregate(pipeline).to_list(length=days)
            
            # Fill missing days with 0
            result = []
            for i in range(days):
                date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
                count = next((t["count"] for t in trends if t["_id"] == date), 0)
                result.append({"date": date, "count": count})
            
            return result
            
        except Exception as e:
            print(f"Search trends error: {str(e)}")
            return []
    
    async def get_popular_questions(self, limit: int = 20) -> List[Dict]:
        """Get most popular questions with counts"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$question",
                        "count": {"$sum": 1},
                        "lastAsked": {"$max": "$createdAt"},
                        "language": {"$first": "$language"}
                    }
                },
                {"$sort": {"count": -1, "lastAsked": -1}},
                {"$limit": limit}
            ]
            
            popular = await self.db.search_history.aggregate(pipeline).to_list(length=limit)
            
            return [
                {
                    "question": item["_id"],
                    "count": item["count"],
                    "lastAsked": item["lastAsked"],
                    "language": item.get("language", "tr")
                }
                for item in popular
            ]
            
        except Exception as e:
            print(f"Popular questions error: {str(e)}")
            return []
    
    async def get_language_distribution(self) -> Dict:
        """Get distribution of questions by language"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$language",
                        "count": {"$sum": 1}
                    }
                }
            ]
            
            distribution = await self.db.search_history.aggregate(pipeline).to_list(length=10)
            
            result = {}
            total = sum(item["count"] for item in distribution)
            
            for item in distribution:
                lang = item["_id"] or "unknown"
                count = item["count"]
                percentage = round((count / total * 100), 1) if total > 0 else 0
                result[lang] = {
                    "count": count,
                    "percentage": percentage
                }
            
            return result
            
        except Exception as e:
            print(f"Language distribution error: {str(e)}")
            return {}
    
    async def get_session_activity(self, limit: int = 50) -> List[Dict]:
        """Get recent session activity"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$sessionId",
                        "searchCount": {"$sum": 1},
                        "firstSearch": {"$min": "$createdAt"},
                        "lastSearch": {"$max": "$createdAt"},
                        "questions": {"$push": "$question"}
                    }
                },
                {"$sort": {"lastSearch": -1}},
                {"$limit": limit}
            ]
            
            sessions = await self.db.search_history.aggregate(pipeline).to_list(length=limit)
            
            return [
                {
                    "sessionId": item["_id"],
                    "searchCount": item["searchCount"],
                    "firstSearch": item["firstSearch"],
                    "lastSearch": item["lastSearch"],
                    "duration": (item["lastSearch"] - item["firstSearch"]).total_seconds() / 60,  # minutes
                    "sampleQuestions": item["questions"][:3]  # First 3 questions
                }
                for item in sessions
            ]
            
        except Exception as e:
            print(f"Session activity error: {str(e)}")
            return []
    
    async def delete_search_history(self, session_id: Optional[str] = None, older_than_days: Optional[int] = None) -> Dict:
        """Delete search history based on criteria"""
        try:
            filter_query = {}
            
            if session_id:
                filter_query["sessionId"] = session_id
            
            if older_than_days:
                cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
                filter_query["createdAt"] = {"$lt": cutoff_date}
            
            if not filter_query:
                return {"error": "No deletion criteria provided"}
            
            result = await self.db.search_history.delete_many(filter_query)
            
            return {
                "deleted_count": result.deleted_count,
                "criteria": filter_query
            }
            
        except Exception as e:
            print(f"Delete history error: {str(e)}")
            return {"error": str(e)}