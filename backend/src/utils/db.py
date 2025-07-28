def get_chat_memory(session_id, title, url, timestamp, messages):
    return {
        "session_id": session_id,
        "title": title,
        "url": url,
        "timestamp": timestamp,
        "messages": messages
    }

# Example usage:
chat = get_chat_memory(
    session_id="test123",
    title="Talk about Tesla",
    url="https://example.com",
    timestamp="2025-07-28T10:00:00+00:00",
    messages=[
        {
            "role": "user",
            "content": "Tell me about Tesla",
            "timestamp": "2025-07-28T10:00:00+00:00"
        },
        {
            "role": "assistant",
            "content": "Tesla is a car company...",
            "timestamp": "2025-07-28T10:00:02+00:00"
        }
    ]
)
print(chat)
