# 🧾 Chat Memory Schema
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class ChatMemory(BaseModel):
    user_id :str
    session_id: str
    title: str
    timestamp: datetime
    messages: List[Message]

# 🧾 Define request schemas
class ChatRequest(BaseModel):
    question: str
    session_id: str  # required for memory handling
    user_id: Optional[str] = None  # Add user_id for conversation tracking
    current_url: Optional[str] = None

class UrlRequest(BaseModel):
    company_name: str

class ConversationRequest(BaseModel):
    user_id: str