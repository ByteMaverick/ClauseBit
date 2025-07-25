from datetime import datetime

import chromadb
from auth.init_vertex import init_vertex_ai
import os
from langchain_chroma import Chroma
from langchain_google_vertexai import VertexAIEmbeddings

from backend.src.tools.datatracker import load_company_index, save_company_index
from backend.src.tools.webscraper import chunking

class VectorStoreManager:
    def __init__(self):
        init_vertex_ai()
        self.embedding_function = VertexAIEmbeddings(model_name="text-embedding-005")  # <- consistent

    def vectordb_setup(self, vectordb_name="vectorDB"):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_warehouse", vectordb_name))


        vector_store = Chroma(
            collection_name=vectordb_name,
            embedding_function=self.embedding_function,
            persist_directory=base_dir
        )
        return "created"

    def sanitize_metadata(self,metadata: dict) -> dict:
        clean = {}
        for k, v in metadata.items():
            if v is None:
                continue  # ❌ Skip None values
            elif isinstance(v, (str, int, float, bool)):
                clean[k] = v
            elif isinstance(v, list):
                clean[k] = ", ".join(map(str, v))  # ✅ Convert list to comma-separated string
            else:
                clean[k] = str(v)  # Catch-all
        return clean

    def vectordb_add(self, docs, vectordb_name="vectorDB"):
        base_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data_warehouse",vectordb_name)
        )
        embeddings = [self.embedding_function.embed_query(doc.page_content) for doc in docs]

        client = chromadb.PersistentClient(path=base_dir)
        collection = client.get_collection(name=vectordb_name)

        collection.add(
            documents=[doc.page_content for doc in docs],
            embeddings=embeddings,
            metadatas=[self.sanitize_metadata(doc.metadata) for doc in docs],
            ids=[f"doc_{i}" for i in range(len(docs))],

        )
        return True

    def vectordb_query_filtering(self, query: dict, vectordb_name="vectorDB", k=3, metadata_filter: dict = None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_warehouse", vectordb_name))

        vectorstore = Chroma(
            collection_name=vectordb_name,
            embedding_function=self.embedding_function,
            persist_directory=base_dir
        )

        results = vectorstore.similarity_search(query, k=k, filter=metadata_filter)
        return results

    def vectordb_query_chatbot(self, query: str, vectordb_name="vectorDB", k=3, metadata_filter: dict = None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_warehouse", vectordb_name))

        vectorstore = Chroma(
            collection_name=vectordb_name,
            embedding_function=self.embedding_function,
            persist_directory=base_dir
        )

        #results = vectorstore.similarity_search(query, k=k, filter=metadata_filter)
        results = vectorstore.max_marginal_relevance_search(query, k=5, lambda_mult=0.6)

        return results



    async def proto_add_final(self, company_name):
        data = await chunking(company_name)
        success = self.vectordb_add(data)
        return success



if __name__ == "__main__":
    import asyncio

    test = VectorStoreManager()

    result = asyncio.run(test.proto_add_final("https://www.homedepot.com/"))
    print(result)





