from google.cloud import firestore
from backend.auth.init_vertex import init_vertex_ai

#Set Firestore Credentials
init_vertex_ai()
# 🧠 Firestore Client
db = firestore.Client()
memory_collection = db.collection("memories")


def generate_conversation_title(question: str) -> str:
    """Generate a meaningful title from the first question"""
    # Simple title generation - you can make this more sophisticated
    if len(question) > 50:
        return question[:47] + "..."
    return question

from datetime import datetime, timezone


def save_conversation(session_id: str, question: str, response: str, user_id: str = None):
    """Save or update a conversation in Firestore"""

    doc_ref = memory_collection.document(session_id)
    doc = doc_ref.get()
    current_timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    if not doc.exists:
        # New conversation
        title = generate_conversation_title(question)
        assistant_timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

        log = {
            "title": title,
            "user_id": user_id,
            "session_id": session_id,
            "timestamp": current_timestamp,
            "url": "",  # Optional: update if needed
            "messages": [
                {
                    "content": question,
                    "timestamp": current_timestamp,
                    "role": "user"
                },
                {
                    "content": response,
                    "timestamp": assistant_timestamp,
                    "role": "assistant"
                }
            ]
        }

        # ✅ Save new conversation using session_id
        doc_ref.set(log)
        return log

    else:
        # Existing conversation → append messages
        existing_data = doc.to_dict()

        existing_data["messages"].append({
            "content": question,
            "timestamp": current_timestamp,
            "role": "user"
        })

        assistant_timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        existing_data["messages"].append({
            "content": response,
            "timestamp": assistant_timestamp,
            "role": "assistant"
        })

        # Update the last modified timestamp
        existing_data["timestamp"] = current_timestamp

        # Update existing doc
        doc_ref.set(existing_data)
        return existing_data




def get_saved_conversation(session_id: str, user_id: str = None):
    doc_ref = memory_collection.document(session_id)
    doc = doc_ref.get()

    if not doc.exists:
        return False

    data = doc.to_dict()

    # Ensure only the owner can access the conversation
    if user_id and data.get("user_id") != user_id:
        return False

    return data

