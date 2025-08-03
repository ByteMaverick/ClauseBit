import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.src.router import router
from google.cloud import firestore
from backend.src.agents.graph import end_point_chat
from backend.src.tools.vector_store import VectorStoreManager
from backend.src.utils.chatbot_memory import save_conversation, get_saved_conversation
from backend.src.utils.models import ChatRequest, ChatMemory, UrlRequest
from backend.src.agents.extension_backend import summary, summary_no_retrieval
from backend.src.tools.datatracker import get_company_by_url

import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="vertexai")


# 🔐 Set Firestore Credentials
from backend.auth.init_vertex import init_vertex_ai
init_vertex_ai()


# 🔧 FastAPI Setup
app = FastAPI()
app.include_router(router)


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
# Updated FastAPI endpoint

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"question: {req.question}")
    print(f"Id: {req.session_id}")
    print(f"User ID: {req.user_id}")
    print(f"url:{req.current_url}")


    message_history =get_saved_conversation(req.session_id,req.user_id)

    if not message_history:
        messages = None
    else:
        messages = message_history["messages"]

    # Process the chat message
    result = end_point_chat(
        question=req.question,
        session_id=req.session_id,
        user_id=req.user_id,
        current_url=req.current_url,  # Add URL to ChatRequest if needed
        conversation_history = messages

    )

    response = result["response"]
    print(f" ClauseBit: {response}")

    # Save conversation
    save_conversation(req.session_id, req.question, response, req.user_id)

    return {"response": response}

@app.post("/summary")
async def summary_endpoint(req: UrlRequest):
    print("🔍 Requested summary for:", req.company_name)

    status = get_company_by_url(req.company_name)

    if type(status) == bool:
        return summary(req.company_name)

    if not status["found_data"]:
        dic = summary_no_retrieval(req.company_name)

    else:
        dic = summary(req.company_name)

    return dic


@app.post("/collector")
async def summary_endpoint(req: UrlRequest):
    print("🔍 Requested collector for:", req.company_name)
    status = get_company_by_url(req.company_name)
    vectorstore = VectorStoreManager()
    if not status:
        print("Triggered Web search!")
        await vectorstore.proto_add_final(req.company_name)


# Save chat
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

# landing page
@app.get("/", response_class=HTMLResponse)
async def root():
    return "<h1>🚀 Server running</h1>"

@app.post("/conversations", response_class=HTMLResponse)
async def conversations():
    print("conversations")
    return "<h1>🚀 Server conversations running</h1>"



# local run
if __name__ == "__main__":
    import os

    port = int(os.getenv("PORT", 8080))  # Cloud Run will set PORT, fallback to 8080 locally

    uvicorn.run("backend.src.api:app", host="0.0.0.0", port=port, reload=True)