from langchain_google_vertexai import ChatVertexAI
from backend.auth.init_vertex import init_vertex_ai
from langchain_core.messages import AIMessage
from langgraph.prebuilt import create_react_agent
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

search_agent = create_react_agent(llm, tools=[retrieve_and_grade])

def search_node(state: ClauseBitState) -> ClauseBitState:
    """Search node with timeout and result limiting"""
    try:
        # Add timeout for search operations
        result = search_agent.invoke(state)

        # Limit response length
        content = result["messages"][-1].content
        #print(f"Using Search Node:{content}")
        if len(content) > 2000:  # Truncate very long responses
            content = content[:2000] + "... [truncated for brevity]"

        new_message = AIMessage(content=content, name="search")

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

    full_prompt = (f"{context}\nCurrent question: {current_question}\n\nProvide a concise, helpful response in a chat format."
                   f"Do not include:  Markdown formatting (like **bold**, bullet points, or headings ")
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

def scraping_in_progress_node(state: ClauseBitState) -> ClauseBitState:
    """ Handle scraping in progress scenario"""
    msg = AIMessage(
        content="🔄 I'm currently analyzing this website's documents. This may take a moment. "
                "Meanwhile, I can answer general questions or you can try your document query again in a few seconds.",
        name="scraping_status"
    )

    return ClauseBitState(
        messages=state.messages + [msg],
        user_preferences=state.user_preferences,
        current_url=state.current_url,
        current_query=state.current_query,
    )

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

