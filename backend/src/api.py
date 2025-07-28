from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uuid
import os

from google.cloud import firestore

from backend.src.utils.chatbot_memory import save_conversation
from backend.src.utils.models import ChatRequest, ChatMemory, UrlRequest

# 🔐 Set Firestore Credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/mohammedansari/Desktop/clausebit/backend/src/utils/clausebit-firestore-key.json"
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
# 🔧 FastAPI Setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 Firestore Client
db = firestore.Client()
memory_collection = db.collection("memories")


# 🚀 Chat endpoint
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"question: {req.question}")
    print(f"Id: {req.session_id}")
    print(f"User ID: {req.user_id}")

    response = f" {req.question}"

    # Save conversation
    save_conversation(req.session_id,req.question,response,req.user_id)
    return response

@app.post("/summary")
@app.post("/summary")
async def summary_endpoint(req: UrlRequest):
    print("🔍 Requested summary for:", req.company_name)
    return dic

@app.post("/classifier")
async def classifier_endpoint(req):
    print(f"company_name: {req.company_name}")
    return f"company_name: {req.company_name}"


# 💾 Save chat
@app.post("/memory/save")
async def save_memory(memory: ChatMemory):
    memory_collection.document(memory.session_id).set(memory.dict())
    return {"status": "saved"}


@app.get("/memory/{user_id}/{session_id}")
async def get_full_chat(user_id: str, session_id: str):
    doc = memory_collection.document(session_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Conversation not found")

    data = doc.to_dict()

    if data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return data  # includes messages


@app.get("/memory/recent/{user_id}/")
async def get_recent_chats(user_id: str):
    docs = (
        memory_collection
        .where("user_id", "==", user_id)
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(20)  # latest 20 chats
        .stream()
    )

    return [
        {
            "session_id": doc.id,
            "title": doc.to_dict().get("title"),
            "timestamp": doc.to_dict().get("timestamp")
        }
        for doc in docs
    ]

# 🏠 landing page
@app.get("/", response_class=HTMLResponse)
async def root():
    return "<h1>🚀 Server running</h1>"

@app.post("/conversations", response_class=HTMLResponse)
async def conversations():
    print("conversations")
    return "<h1>🚀 Server conversations running</h1>"



# ⏯️ Optional local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)
