# Python Imports
from typing import List, Dict
# Optimization Imports
from concurrent.futures import ThreadPoolExecutor
from backend.src.tools.datatracker import get_company_by_url
from functools import lru_cache
import asyncio
# Local imports
from backend.src.tools.vector_store import VectorStoreManager
from backend.src.tools.grader import Grader
# Tool setup
from langchain_core.tools import tool

# temp
import os
os.environ["LANGCHAIN_TRACING_V2"] = "false"

# Cache expensive operations
@lru_cache(maxsize=100)
def get_cached_db_status(url: str):
    """Cache database status checks to avoid repeated lookups"""
    return get_company_by_url(url)

# Thread pool for I/O operations
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
def retrieve_and_grade(query: str, is_preference_data: bool = False, metadata: Dict[str, str] = None)-> List[Dict]:
    """Retrieves chunks for a query and grades them for relevance, completeness, and faithfulness."""
    vectorstore = VectorStoreManager()
    grader = Grader()

    if is_preference_data:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query, metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query = query, metadata_filter = metadata)

    # Extract only the page_content to feed into the grader
    chunk_texts = [doc.page_content for doc in retrieved_chunks]
    # Grade the extracted texts
    grade_report = grader.CompositeGrader(chunk_texts, query)
    # merge the mean chunk quality score in the chunk document
    for chunk in retrieved_chunks:
        chunk.metadata["retrieval_quality_score"] = grade_report

    return retrieved_chunks


@tool
def retriever(query: str, ispreferencedata: bool = False, metadata: Dict[str, str] = None) -> List[Dict]:
    """ OPTIMIZED: Faster retrieval with caching and limits"""
    vectorstore = VectorStoreManager()

    # Limit results for faster processing
    if ispreferencedata:
        retrieved_chunks = vectorstore.vectordb_query_filtering(query, metadata)
    else:
        retrieved_chunks = vectorstore.vectordb_query_chatbot(query)

    # Limit to top 5 results for faster processing
    return retrieved_chunks

# Cached status check
def check_db(url: str):
    return get_cached_db_status(url)
