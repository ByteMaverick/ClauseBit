from typing import Annotated, List, Dict
from langchain_core.tools import tool
from backend.src.tools.webscraper import ScraperManager
from backend.src.tools.vector_store import VectorStoreManager
from backend.src.tools.grader import Grader

import asyncio
import nest_asyncio
nest_asyncio.apply()

@tool
async def fetch_web_data_to_db(url: str):
    """Scrapes legal or policy content from the web and saves it to the database."""
    scraper = ScraperManager()
    vectorstore = VectorStoreManager()

    chunks = await scraper.chunking(url)
    saving_into_db = vectorstore.vectordb_add(chunks[0:5])

    return f" Data Stored: {saving_into_db}"

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


