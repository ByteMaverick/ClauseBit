from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional
import uuid

# In-memory storage for conversations (use database in production)
conversations_storage: Dict[str, Dict] = {}
user_conversations: Dict[str, List[str]] = {}  # user_id -> list of conversation_ids

dic = {
    "riskLevel": "Some risks found",
    "summaryText": "Data sharing is allowed with third parties.",
    "clauses": [
        {
            "type": "danger",
            "icon": "alert-triangle",
            "title": "Data Sharing",
            "description": "Your data may be shared with third parties such as vendors and partners.",
            "action": "Why?"
        },
        {
            "type": "neutral",
            "icon": "database",
            "title": "Data Retention",
            "description": "Your data is stored for at least 6 months after your account is deleted. fff"
        },
        {
            "type": "success",
            "icon": "check-circle",
            "title": "Location Tracking",
            "description": "Your location is not tracked.",
            "action": "Flag inaccurate"
        },
        {
            "type": "success",
            "icon": "check-circle",
            "title": "Data Security",
            "description": "Reasonable measures are used to protect your data. nice"
        }
    ]
}


# 🧾 Define request schemas
class ChatRequest(BaseModel):
    question: str
    session_id: str  # required for memory handling
    user_id: Optional[str] = None  # Add user_id for conversation tracking


class UrlRequest(BaseModel):
    company_name: str


class ConversationRequest(BaseModel):
    user_id: str


class Conversation(BaseModel):
    id: str
    title: str
    time: str
    last_message: str
    created_at: datetime


# 🔧 FastAPI Setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_conversation_title(question: str) -> str:
    """Generate a meaningful title from the first question"""
    # Simple title generation - you can make this more sophisticated
    if len(question) > 50:
        return question[:47] + "..."
    return question


def format_time_ago(created_at: datetime) -> str:
    """Format datetime to human readable 'time ago' format"""
    now = datetime.now()
    diff = now - created_at

    if diff.days > 0:
        if diff.days == 1:
            return "Yesterday"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        else:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


def save_conversation(session_id: str, question: str, response: str, user_id: str = None):
    """Save or update conversation in storage"""
    if session_id not in conversations_storage:
        # New conversation
        conversation_id = str(uuid.uuid4())
        title = generate_conversation_title(question)
        created_at = datetime.now()

        conversations_storage[session_id] = {
            "id": conversation_id,
            "title": title,
            "created_at": created_at,
            "messages": [],
            "user_id": user_id
        }

        # Track user conversations
        if user_id:
            if user_id not in user_conversations:
                user_conversations[user_id] = []
            user_conversations[user_id].append(session_id)

    # Add message to conversation
    conversations_storage[session_id]["messages"].append({
        "question": question,
        "response": response,
        "timestamp": datetime.now()
    })


# 🚀 Chat endpoint
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"question: {req.question}")
    print(f"Id: {req.session_id}")
    print(f"User ID: {req.user_id}")

    response = f" {req.question}"

    # Save conversation
    save_conversation(req.session_id, req.question, response, req.user_id)

    return response


# 📜 Get conversations for a user
@app.post("/conversations")
async def get_conversations(req: ConversationRequest):
    """Get recent conversations for a user"""
    user_id = req.user_id

    if user_id not in user_conversations:
        return []

    # Get user's conversation sessions
    user_session_ids = user_conversations[user_id]

    # Build response
    conversations = []
    for session_id in reversed(user_session_ids[-10:]):  # Get last 10 conversations
        if session_id in conversations_storage:
            conv = conversations_storage[session_id]
            conversations.append({
                "id": conv["id"],
                "title": conv["title"],
                "time": format_time_ago(conv["created_at"]),
                "session_id": session_id,
                "message_count": len(conv["messages"])
            })

    return conversations


# 💬 Get specific conversation messages
@app.get("/conversation/{session_id}")
async def get_conversation_messages(session_id: str):
    """Get all messages from a specific conversation"""
    if session_id not in conversations_storage:
        return {"error": "Conversation not found"}

    conversation = conversations_storage[session_id]
    return {
        "id": conversation["id"],
        "title": conversation["title"],
        "created_at": conversation["created_at"].isoformat(),
        "messages": [
            {
                "question": msg["question"],
                "response": msg["response"],
                "timestamp": msg["timestamp"].isoformat()
            }
            for msg in conversation["messages"]
        ]
    }


# 🗑️ Delete conversation
@app.delete("/conversation/{session_id}")
async def delete_conversation(session_id: str):
    """Delete a specific conversation"""
    if session_id not in conversations_storage:
        return {"error": "Conversation not found"}

    # Get user_id before deleting
    user_id = conversations_storage[session_id].get("user_id")

    # Remove from storage
    del conversations_storage[session_id]

    # Remove from user's conversation list
    if user_id and user_id in user_conversations:
        user_conversations[user_id] = [
            conv_id for conv_id in user_conversations[user_id]
            if conv_id != session_id
        ]

    return {"message": "Conversation deleted successfully"}


@app.post("/summary")
async def summary_endpoint(req: UrlRequest):
    print("🔍 Requested summary for:", req.company_name)
    return dic


@app.post("/classifier")
async def classifier_endpoint(req: UrlRequest):
    # return the url
    print(f"company_name: {req.company_name}")
    return f"company_name: {req.company_name}"


# 🏠 landing page
@app.get("/", response_class=HTMLResponse)
async def root():
    return "<h1>🚀 Server running</h1>"


# ⏯️ Optional local run
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)