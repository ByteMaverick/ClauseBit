# Multi agent setup imports
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage
from pydantic import BaseModel

# Python Imports
from typing import Annotated
from typing import List, Optional, Dict, Any


class ClauseBitState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages]
    user_preferences: Optional[Dict[str, Any]] = None
    current_url: Optional[str] = None
    current_query: Optional[str] = None
    user_id: Optional[str] = None  # Firebase UID or local session user
    session_id: Optional[str] = None  # Unique ID per chat session



