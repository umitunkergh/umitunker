from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class SearchRequest(BaseModel):
    question: str
    sessionId: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))


class SearchResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    question: str
    answer: str
    examples: List[str] = []
    relatedTerms: List[str] = []
    language: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SearchHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    question: str
    answer: str
    examples: List[str] = []
    relatedTerms: List[str] = []
    language: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)