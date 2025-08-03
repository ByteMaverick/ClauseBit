import re

from langchain_google_vertexai import ChatVertexAI
from backend.auth.init_vertex import init_vertex_ai
from langchain_core.messages import AIMessage

# Local Imports
from backend.src.agents.research_team import retrieve_and_grade
from backend.src.agents.state_setup import ClauseBitState
from backend.src.agents.research_team import get_cached_db_status


init_vertex_ai()

llm = ChatVertexAI(
    model="gemini-2.5-pro",
    temperature=0.3,  # Lower temperature for faster, more deterministic responses
    max_output_tokens=1500  # Reduced from 3000 for faster generation
)


def extract_email(text):
    """Extract the url"""

    pattern = r"https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}"

    match = re.search(pattern, text)
    if match:
        url = match.group() + '/'
        return url

    else:
        return False


def search_node(state: ClauseBitState) -> ClauseBitState:
    """Search node with timeout and result limiting"""
    try:

        print("Using Search Agent....")


        user_question = state.messages[-1].content.lower().strip()
        url_check = extract_email(user_question)

        if url_check:
            state.current_url = url_check


        metadata = {"domain":state.current_url}
        print(metadata)
        print(f"current qurstion {user_question}")
        context = retrieve_and_grade(query = user_question, metadata =metadata )
        print(f"context:{context}")

        full_prompt = (
            f"{context}\nCurrent question: {user_question}\n\nProvide a concise, helpful response in a chat format."
            f"Do not include:  Markdown formatting (like **bold**, bullet points, or headings ")
        print(f"Using LLM Node:{full_prompt}")
        llm_response = llm.invoke(full_prompt)
        response_content = llm_response.content

        new_message = AIMessage(content=response_content, name="search")

        return ClauseBitState(
            messages=state.messages + [new_message],
            user_preferences=state.user_preferences,
            current_url=state.current_url,
            current_query=state.current_query,

        )
    except Exception as e:
        # Quick fallback on search failure
        error_msg = AIMessage(content=f"Search temporarily unavailable. Error: {str(e)[:100]}", name="search")
        return ClauseBitState(
            messages=state.messages + [error_msg],
            user_preferences=state.user_preferences,
            current_url=state.current_url,
            current_query=state.current_query,
        )

def llm_answer_node(state: ClauseBitState) -> ClauseBitState:
    """ Faster LLM responses with shorter context"""
    current_question =state.messages[-1]
    context = state.messages
    rag_chunks = state.context[-5:]
    print("Using LLM Agent....")
    full_prompt = (
        f"{context}\n"
        f"Current question: {current_question}\n\n"
        f"Last retrieved documents: {rag_chunks}\n"
        f"Provide a concise, helpful response in a chat format. "
        f"Do not include: Markdown formatting (like **bold**, bullet points, or headings)"
    )
    #print(f"Using LLM Node:{full_prompt}")
    llm_response = llm.invoke(full_prompt)
    response_content = llm_response.content

    new_message = AIMessage(content=response_content, name="llm_answer")

    return ClauseBitState(
        messages=state.messages + [new_message],
        user_preferences=state.user_preferences,
        current_url=state.current_url,
        current_query=state.current_query,
    )

import asyncio
from typing import Tuple

async def scraping_in_progress_node(state: ClauseBitState) -> Tuple[str, ClauseBitState]:
    msg = AIMessage(
        content=(
            "🔄 I'm currently analyzing this website's documents. "
            "Please wait a moment. Meanwhile, you can ask general questions or retry shortly."
        ),
        name="scraping_status"
    )

    updated_state = ClauseBitState(
        messages=state.messages + [msg],
        user_preferences=state.user_preferences,
        current_url=state.current_url,
        current_query=state.current_query,
        user_id=state.user_id,
        session_id=state.session_id,
        context=state.context,
    )

    await asyncio.sleep(60)  # ⏳ Wait before returning to supervisor

    return "supervisor", updated_state


def error_handler_node(state: ClauseBitState) -> ClauseBitState:
    """Handle errors and edge cases"""
    if not state.current_url:
        error_msg = AIMessage(content="No URL provided. Cannot proceed.")
    else:
        db_status = get_cached_db_status(state.current_url)
        if db_status and db_status.get("found_data") is False:
            error_msg = AIMessage(
                content="I can't answer questions for this company — no useful data was found during scraping.")
        else:
            error_msg = AIMessage(content="An error occurred while processing your request.")

    return ClauseBitState(
        messages=state.messages + [error_msg],
        user_preferences=state.user_preferences,
        current_url=state.current_url,
        current_query=state.current_query,
    )

