from typing import TypedDict, Literal
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.language_models.chat_models import BaseChatModel
import re

#Local Imports
from backend.src.agents.state_setup import  ClauseBitState
from backend.src.agents.research_team import get_cached_db_status,fetch_web_data_to_db_async


def extract_email(text):
    """Extract the url"""

    pattern = r"https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}"

    match = re.search(pattern, text)
    if match:
        url = match.group() + '/'
        return url

    else:
        return False


def make_supervisor_node(llm: BaseChatModel, members: list[str]):
    options = ["FINISH"] + members

    def supervisor_node(state: ClauseBitState) -> str:
        if not isinstance(state.messages[-1], HumanMessage):
            return "FINISH"

        # The last question asked
        user_question = state.messages[-1].content.lower().strip()
        state.current_query =user_question

        print("[Supervisor received message]:", user_question)

         # OPTIMIZATION 5: Fast keyword-based routing (skip LLM for obvious cases)
        conversation_keywords = [
            "what was the last question", "what did i ask", "previous question",
            "last time", "before", "earlier", "conversation history"
        ]

        if any(keyword in user_question for keyword in conversation_keywords):
            return "llm_answer"

        url_check = extract_email(user_question)

        if url_check:
            return "search"


        # OPTIMIZATION: Async scraping (non-blocking)
        db_status = get_cached_db_status(state.current_url)


        if db_status == False:

            print("🚀 Starting async scraping...")
            # Start scraping in background
            fetch_web_data_to_db_async(state.current_url)

            # For now, return scraping is in progress
            return "scraping_in_progress_node"


        if db_status["found_data"] is False:
            return  "llm_answer"

        system_prompt = (
            "You are a supervisor agent managing a conversation with access to two workers: `search` and `llm_answer`.\n\n"
            "• If the user asks a general-purpose or factual question that can be answered by a language model (e.g., 'What are cookies?', 'Is GitHub a known company?'), route to `llm_answer`.\n"
            "• If the user asks something that requires information from a specific website's legal documents (e.g., Privacy Policy or Terms of Service), route to `search`.\n"
            "• If the user gave a url  (e.g., Privacy Policy or Terms of Service), route to `search`.\n"
            "Do not include:  Markdown formatting (like **bold**, bullet points, or headings "
        )

        class Router(TypedDict):
            next: Literal[*options]


        recent_messages = state.messages
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
            #print(f"[Invalid route '{goto}'], routing to llm_answer")
            return "llm_answer"


        return goto



    return supervisor_node

