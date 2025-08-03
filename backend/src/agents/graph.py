from typing import Optional, List, Dict

from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_vertexai import ChatVertexAI
from langgraph.graph import StateGraph, END

#Local Imports
from backend.src.agents.state_setup import ClauseBitState
from backend.src.agents.supervisor_agent import make_supervisor_node
from backend.src.agents.agents_setup import search_node,llm_answer_node,scraping_in_progress_node,error_handler_node
from backend.auth.init_vertex import init_vertex_ai
from backend.src.utils.models import Message

# Temp: LLM setup
init_vertex_ai()

llm = ChatVertexAI(
    model="gemini-2.5-pro",
    temperature=0.3,  # Lower temperature for faster, more deterministic responses
    max_output_tokens=1500  # Reduced from 3000 for faster generation
)
# Create supervisor node
research_supervisor_node = make_supervisor_node(llm, ["search", "llm_answer", "scraping_in_progress"])


def route_supervisor_decision(state: ClauseBitState):
    """Route based on supervisor's decision"""
    decision = research_supervisor_node(state)
    return decision

graph = StateGraph(ClauseBitState)
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



            user_msg = HumanMessage(content=inp)
            conversation_messages.append(user_msg)

            state = ClauseBitState(messages=conversation_messages, current_url=url)
            result = research_graph.invoke(state)

            msgs = result["messages"]
            last_ai_messages = [m for m in msgs if isinstance(m, AIMessage)]

            if last_ai_messages:
                response = last_ai_messages[-1].content

                print(f"🚀 ClauseBit: {response}")
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

def end_point_chat( question: str,
        session_id: str,
        user_id: str,
        current_url: Optional[str] = None,
        conversation_history: Optional[List[Message]] = None)-> Dict[str, any]:


    # Initialize conversation history if none provided
    if conversation_history is None:
        conversation_history = []

    # Convert existing messages to the format expected by your research_graph
    conversation_messages = []
    for msg in conversation_history:
        if msg["role"] == "user":
            conversation_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"]== "assistant":
            conversation_messages.append(AIMessage(content=msg["content"]))

    # Add current question
    user_msg = HumanMessage(content=question)
    conversation_messages.append(user_msg)

    # Process with your research graph
    state = ClauseBitState(messages=conversation_messages, current_url=current_url)
    result = research_graph.invoke(state)

    # Extract response
    msgs = result["messages"]
    last_ai_messages = [m for m in msgs if isinstance(m, AIMessage)]

    if last_ai_messages:
        response = last_ai_messages[-1].content


        return {
            "response": response,
            "status": "success",
            "session_id": session_id,
            "user_id": user_id,
            "current_url": current_url
        }
    else:
        return {
            "response": "No response generated",
            "status": "no_response",
            "session_id": session_id,
            "user_id": user_id,
            "current_url": current_url
        }






