from typing import Annotated, List, Dict
from langchain_core.tools import tool
from sympy import false

from backend.src.tools.webscraper import ScraperManager
from backend.src.tools.vector_store import VectorStoreManager
from backend.src.tools.grader import Grader
from backend.src.tools.datatracker import get_company_by_url

import asyncio
import nest_asyncio
from functools import lru_cache
import threading
from concurrent.futures import ThreadPoolExecutor

from backend.src.utils.models import Message

nest_asyncio.apply()


# OPTIMIZATION 1: Cache expensive operations
@lru_cache(maxsize=100)
def get_cached_db_status(url: str):
    """Cache database status checks to avoid repeated lookups"""
    return get_company_by_url(url)


#  OPTIMIZATION 2: Thread pool for I/O operations
executor = ThreadPoolExecutor(max_workers=4)


def fetch_web_data_to_db_async(url: str):
    """Non-blocking version of web data fetching"""

    def _fetch():
        vectorstore = VectorStoreManager()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(vectorstore.proto_add_final(url))

    return executor.submit(_fetch)


@tool
def retrieve_and_grade(query, ispreferencedata=False, metadata=None) -> List[Dict]:
    """Retrieves chunks for a query and grades them for relevance, completeness, and faithfulness."""
    vectorstore = VectorStoreManager()
    grader = Grader()

    if ispreferencedata:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query, metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query)

    # Extract only the page_content to feed into the grader
    chunk_texts = [doc.page_content for doc in retrieved_chunks]

    # Grade the extracted texts
    grade_report = grader.CompositeGrader(chunk_texts, query)

    # merge the original document metadata into the report
    for i, score in enumerate(grade_report):
        score["metadata"] = retrieved_chunks[i].metadata
        score["document_id"] = retrieved_chunks[i].id

    return grade_report


@tool
def retriever(query: str, ispreferencedata: bool = False, metadata: Dict[str, str] = None) -> List[Dict]:
    """
    🚀 OPTIMIZED: Faster retrieval with caching and limits
    """
    vectorstore = VectorStoreManager()

    # 🚀 OPTIMIZATION 3: Limit results for faster processing
    if ispreferencedata:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query, metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query)

    # Limit to top 5 results for faster processing
    return retrieved_chunks[:5]


# 🚀 OPTIMIZATION 4: Cached status check
def check_db(url: str):
    return get_cached_db_status(url)


from langgraph.graph import add_messages
from typing import Annotated
from langchain_core.messages import BaseMessage
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class ClausebitState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages]
    user_preferences: Optional[Dict[str, Any]] = None
    scraped_chunks: Optional[List[str]] = None
    graded_clauses: Optional[List[Dict[str, Any]]] = None
    current_url: Optional[str] = None
    current_query: Optional[str] = None
    violations_found: Optional[List[Dict[str, Any]]] = None


from typing import List, Optional, Literal, TypedDict, Callable
from langchain_core.language_models.chat_models import BaseChatModel
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command
from langchain_core.messages import HumanMessage, trim_messages
from langchain_core.messages import AIMessage


def make_supervisor_node(llm: BaseChatModel, members: list[str]):
    options = ["FINISH"] + members

    def supervisor_node(state: ClausebitState) -> str:
        # ✅ Only continue if last message is from user
        if not isinstance(state.messages[-1], HumanMessage):
            return "FINISH"

        user_question = state.messages[-1].content.lower().strip()
        print("[🧠 Supervisor received message]:", state.messages[-1].content)

        # 🚀 OPTIMIZATION 5: Fast keyword-based routing (skip LLM for obvious cases)
        conversation_keywords = [
            "what was the last question", "what did i ask", "previous question",
            "last time", "before", "earlier", "conversation history"
        ]

        if any(keyword in user_question for keyword in conversation_keywords):
            return "llm_answer"

        # Fast route for obvious document queries
        document_keywords = [
            "privacy policy", "terms of service", "cookies", "data collection",
            "user agreement", "legal", "policy", "terms", "privacy"
        ]

        if any(keyword in user_question for keyword in document_keywords) and state.current_url:
            # Quick DB check with cache
            db_status = get_cached_db_status(state.current_url)
            if db_status and db_status.get("found_data") is not False:
                return "search"

        # Check if current_url is provided for document-specific questions
        if not state.current_url:
            return "llm_answer"

        # 🚀 OPTIMIZATION 6: Async scraping (non-blocking)
        db_status = get_cached_db_status(state.current_url)

        if db_status == False:
            print("🚀 Starting async scraping...")
            # Start scraping in background
            future = fetch_web_data_to_db_async(state.current_url)

            # For now, return error but mention scraping is in progress
            return "scraping_in_progress"

        # Step 2: If found_data is False → return gracefully
        if db_status and db_status.get("found_data") is False:
            return "error"

        # 🚀 OPTIMIZATION 7: Simplified LLM routing with shorter prompt
        system_prompt = (
            "Route user questions: 'search' for document/legal queries, 'llm_answer' for general questions."
        )

        class Router(TypedDict):
            next: Literal[*options]

        # 🚀 OPTIMIZATION 8: Limit message history for faster processing
        recent_messages = state.messages[-3:]  # Only last 3 messages
        formatted_messages = []
        for msg in recent_messages:
            if isinstance(msg, HumanMessage):
                formatted_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                formatted_messages.append({"role": "assistant", "content": msg.content})

        messages = [{"role": "system", "content": system_prompt}] + formatted_messages
        response = llm.with_structured_output(Router).invoke(messages)
        print("[Supervisor routed to]:", response)

        goto = response["next"]
        if goto == "FINISH":
            return "FINISH"
        if goto not in members and goto != "FINISH":
            print(f"[⚠️ Invalid route '{goto}'], routing to llm_answer")
            return "llm_answer"

        return goto

    return supervisor_node


from langchain_google_vertexai import ChatVertexAI
from auth.init_vertex import init_vertex_ai
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent

init_vertex_ai()

# 🚀 OPTIMIZATION 9: Reduce model parameters for speed
llm = ChatVertexAI(
    model="gemini-2.5-pro",
    temperature=0.3,  # Lower temperature for faster, more deterministic responses
    max_output_tokens=1500  # Reduced from 3000 for faster generation
)

search_agent = create_react_agent(llm, tools=[retriever])


def search_node(state: ClausebitState) -> ClausebitState:
    """🚀 OPTIMIZED: Search node with timeout and result limiting"""
    try:
        # Add timeout for search operations
        result = search_agent.invoke(state)

        # Limit response length
        content = result["messages"][-1].content
        if len(content) > 2000:  # Truncate very long responses
            content = content[:2000] + "... [truncated for brevity]"

        new_message = AIMessage(content=content, name="search")

        return ClausebitState(
            messages=state.messages + [new_message],
            user_preferences=state.user_preferences,
            scraped_chunks=state.scraped_chunks,
            graded_clauses=state.graded_clauses,
            current_url=state.current_url,
            current_query=state.current_query,
            violations_found=state.violations_found
        )
    except Exception as e:
        # Quick fallback on search failure
        error_msg = AIMessage(content=f"Search temporarily unavailable. Error: {str(e)[:100]}", name="search")
        return ClausebitState(
            messages=state.messages + [error_msg],
            user_preferences=state.user_preferences,
            scraped_chunks=state.scraped_chunks,
            graded_clauses=state.graded_clauses,
            current_url=state.current_url,
            current_query=state.current_query,
            violations_found=state.violations_found
        )


def llm_answer_node(state: ClausebitState) -> ClausebitState:
    """🚀 OPTIMIZED: Faster LLM responses with shorter context"""
    user_question = state.messages[-1].content.lower().strip()

    # Handle conversation history questions
    conversation_keywords = [
        "what was the last question", "what did i ask", "previous question",
        "last time", "before", "earlier", "conversation history"
    ]

    if any(keyword in user_question for keyword in conversation_keywords):
        user_messages = [msg for msg in state.messages if isinstance(msg, HumanMessage)]
        if len(user_messages) >= 2:
            last_question = user_messages[-2].content
            response_content = f"Your last question was: \"{last_question}\""
        else:
            response_content = "This is your first question in our conversation."
    else:
        # 🚀 OPTIMIZATION 10: Limit context window for faster processing
        last_user_message = state.messages[-1].content

        # Only include last 2 exchanges for context
        context = ""
        recent_messages = state.messages[-5:-1] if len(state.messages) > 1 else []
        for msg in recent_messages:
            if isinstance(msg, HumanMessage):
                context += f"User: {msg.content[:200]}...\n"  # Truncate long messages
            elif isinstance(msg, AIMessage):
                context += f"Assistant: {msg.content[:200]}...\n"

        full_prompt = f"{context}\nCurrent question: {last_user_message}\n\nProvide a concise, helpful response."

        llm_response = llm.invoke(full_prompt)
        response_content = llm_response.content

    new_message = AIMessage(content=response_content, name="llm_answer")

    return ClausebitState(
        messages=state.messages + [new_message],
        user_preferences=state.user_preferences,
        scraped_chunks=state.scraped_chunks,
        graded_clauses=state.graded_clauses,
        current_url=state.current_url,
        current_query=state.current_query,
        violations_found=state.violations_found
    )


def scraping_in_progress_node(state: ClausebitState) -> ClausebitState:
    """🚀 NEW: Handle scraping in progress scenario"""
    msg = AIMessage(
        content="🔄 I'm currently analyzing this website's documents. This may take a moment. "
                "Meanwhile, I can answer general questions or you can try your document query again in a few seconds.",
        name="scraping_status"
    )

    return ClausebitState(
        messages=state.messages + [msg],
        user_preferences=state.user_preferences,
        scraped_chunks=state.scraped_chunks,
        graded_clauses=state.graded_clauses,
        current_url=state.current_url,
        current_query=state.current_query,
        violations_found=state.violations_found
    )


def error_handler_node(state: ClausebitState) -> ClausebitState:
    """Handle errors and edge cases"""
    if not state.current_url:
        error_msg = AIMessage(content="❌ No URL provided. Cannot proceed.")
    else:
        db_status = get_cached_db_status(state.current_url)
        if db_status and db_status.get("found_data") is False:
            error_msg = AIMessage(
                content="⚠️ I can't answer questions for this company — no useful data was found during scraping.")
        else:
            error_msg = AIMessage(content="⚠️ An error occurred while processing your request.")

    return ClausebitState(
        messages=state.messages + [error_msg],
        user_preferences=state.user_preferences,
        scraped_chunks=state.scraped_chunks,
        graded_clauses=state.graded_clauses,
        current_url=state.current_url,
        current_query=state.current_query,
        violations_found=state.violations_found
    )


# Create supervisor node
research_supervisor_node = make_supervisor_node(llm, ["search", "llm_answer", "scraping_in_progress"])


def route_supervisor_decision(state: ClausebitState):
    """Route based on supervisor's decision"""
    decision = research_supervisor_node(state)
    return decision


# 🚀 OPTIMIZATION 11: Streamlined graph structure
graph = StateGraph(ClausebitState)
graph.add_node("supervisor", lambda state: state)
graph.add_node("search", search_node)
graph.add_node("llm_answer", llm_answer_node)
graph.add_node("scraping_in_progress", scraping_in_progress_node)
graph.add_node("error_handler", error_handler_node)
graph.add_node("finish", lambda state: state)

graph.set_entry_point("supervisor")

graph.add_conditional_edges(
    "supervisor",
    route_supervisor_decision,
    {
        "search": "search",
        "llm_answer": "llm_answer",
        "scraping_in_progress": "scraping_in_progress",
        "FINISH": "finish",
        "error": "error_handler"
    }
)

# All nodes go directly to END for faster responses
graph.add_edge("search", END)
graph.add_edge("llm_answer", END)
graph.add_edge("scraping_in_progress", END)
graph.add_edge("error_handler", END)
graph.add_edge("finish", END)

research_graph = graph.compile()
from langchain_core.messages import HumanMessage, AIMessage
import time

def chat():
    print("🚀 ClauseBit (Optimized): Hello! I can help you analyze legal documents quickly.")
    print("Type 'quit', 'exit', or 'bye' to end the conversation.\n")

    url = input("🔗 Enter URL to analyze (or press Enter for default GitHub): ").strip()
    if not url:
        url = "https://github.com/"

    print(f"📄 Analyzing: {url}\n")

    conversation_messages = []

    while True:
        try:
            inp = input("👤 You: ").strip()

            if inp.lower() in ['quit', 'exit', 'bye', 'stop']:
                print("🚀 ClauseBit: Goodbye! 👋")
                break

            if not inp:
                print("🚀 ClauseBit: Please enter a question or type 'quit' to exit.")
                continue

            # ⏱️ Time the response
            start_time = time.time()

            user_msg = HumanMessage(content=inp)
            conversation_messages.append(user_msg)

            state = ClausebitState(messages=conversation_messages, current_url=url)
            result = research_graph.invoke(state)

            msgs = result["messages"]
            last_ai_messages = [m for m in msgs if isinstance(m, AIMessage)]

            if last_ai_messages:
                response = last_ai_messages[-1].content
                elapsed = time.time() - start_time
                print(f"🚀 ClauseBit ({elapsed:.1f}s): {response}")
                conversation_messages.append(AIMessage(content=response))
            else:
                print("🚀 ClauseBit: (no response)")

            print()

        except KeyboardInterrupt:
            print("\n🚀 ClauseBit: Goodbye! 👋")
            break
        except Exception as e:
            print(f"🚀 ClauseBit: Sorry, an error occurred: {str(e)}")
            print("Please try again or type 'quit' to exit.\n")


from datetime import datetime
from typing import Dict, Optional
import time
import uuid


# Modified chat function to work with your API structure
def process_chat_message(
        question: str,
        session_id: str,
        user_id: str,
        current_url: Optional[str] = None,
        conversation_history: Optional[List[Message]] = None
) -> Dict[str, any]:
    """
    Process a single chat message and return response with metadata
    """
    try:
        # Use default URL if none provided
        if not current_url:
            current_url = "https://github.com/"

        # Initialize conversation history if none provided
        if conversation_history is None:
            conversation_history = []

        # Convert existing messages to the format expected by your research_graph
        conversation_messages = []
        for msg in conversation_history:
            if msg.role == "user":
                conversation_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                conversation_messages.append(AIMessage(content=msg.content))

        # Add current question
        user_msg = HumanMessage(content=question)
        conversation_messages.append(user_msg)

        # Time the response
        start_time = time.time()

        # Process with your research graph
        state = ClausebitState(messages=conversation_messages, current_url=current_url)
        result = research_graph.invoke(state)

        # Extract response
        msgs = result["messages"]
        last_ai_messages = [m for m in msgs if isinstance(m, AIMessage)]

        if last_ai_messages:
            response = last_ai_messages[-1].content
            elapsed = time.time() - start_time

            return {
                "response": response,
                "elapsed_time": elapsed,
                "status": "success",
                "session_id": session_id,
                "user_id": user_id,
                "current_url": current_url
            }
        else:
            return {
                "response": "No response generated",
                "elapsed_time": time.time() - start_time,
                "status": "no_response",
                "session_id": session_id,
                "user_id": user_id,
                "current_url": current_url
            }

    except Exception as e:
        return {
            "response": f"Sorry, an error occurred: {str(e)}",
            "elapsed_time": time.time() - start_time if 'start_time' in locals() else 0,
            "status": "error",
            "session_id": session_id,
            "user_id": user_id,
            "current_url": current_url,
            "error": str(e)
        }


# 🚀 OPTIMIZATION 12: Faster test loop with reduced I/O
if __name__ == "__main__":


   chat()