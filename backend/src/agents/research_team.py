from typing import Annotated, List, Dict
from langchain_core.tools import tool
from langchain_google_vertexai import ChatVertexAI

from auth.init_vertex import init_vertex_ai
from backend.src.tools.datatracker import get_company_by_url
from backend.src.tools.webscraper import ScraperManager
from backend.src.tools.vector_store import VectorStoreManager
from backend.src.tools.grader import Grader

import asyncio
import nest_asyncio
nest_asyncio.apply()

from langchain_google_vertexai import ChatVertexAI
from auth.init_vertex import init_vertex_ai
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from setup import ClausebitState, make_supervisor_node
from typing import List, Optional, Literal, TypedDict
from langchain_core.language_models.chat_models import BaseChatModel

from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command
from langchain_core.messages import HumanMessage, trim_messages



@tool
def fetch_web_data_to_db(url: str) -> str:
    """Scrapes and chunks legal content from a URL, then saves it to the vector DB."""
    scraper = ScraperManager()

    try:
        # Run async chunking
        chunks = asyncio.run(scraper.chunking(url))
    except Exception as e:
        return f"❌ Error during scraping: {e}"

    if not chunks:
        return "❌ No chunks extracted or chunking failed."

    vectorstore = VectorStoreManager()

    try:
        # Run async vector DB saving
        asyncio.run(vectorstore.vectordb_add(chunks[:5]))
    except Exception as e:
        return f"❌ Error during vector DB add: {e}"

    return f"✅ Data stored successfully. Chunks added: {min(len(chunks), 5)}"


@tool
def retrieve_and_grade(query, ispreferencedata = False, metadata=None) -> List[Dict]:
    """Retrieves chunks for a query and grades them for relevance, completeness, and faithfulness."""

    vectorstore = VectorStoreManager()
    grader = Grader()

    if ispreferencedata:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query,metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query)

     # Extract only the page_content to feed into the grader
    chunk_texts = [doc.page_content for doc in retrieved_chunks]

    # Grade the extracted texts
    grade_report = grader.CompositeGrader(chunk_texts, query)

    #  merge the original document metadata into the report
    for i, score in enumerate(grade_report):
        score["metadata"] = retrieved_chunks[i].metadata
        score["document_id"] = retrieved_chunks[i].id

    return grade_report


@tool
def retriever(query: str, ispreferencedata: bool = False,metadata: Dict[str,str] = None) -> List[Dict]:
    """
    Retrieves the most relevant chunks from the vector store for a given query.
    Use this when the user asks about a topic that may exist in stored documents.
    """

    vectorstore = VectorStoreManager()
    grader = Grader()

    if ispreferencedata:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query,metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query)

    return  retrieved_chunks


@tool
def check_db(url:str):
    """ Check if this URL has already been scraped and indexed.
    Use this before fetching or retrieving anything for a website.
  """
    status = get_company_by_url(url)

    if not status:
        return False
    else:
        return status




init_vertex_ai()


llm = ChatVertexAI(
            model="gemini-2.0-flash-lite",
            temperature=0.8,
            max_output_tokens=8000
        )

