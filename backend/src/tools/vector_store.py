import chromadb
from backend.auth.init_vertex import init_vertex_ai
import os
from langchain_chroma import Chroma
from langchain_google_vertexai import VertexAIEmbeddings
from backend.src.tools.webscraper import ScraperManager

class VectorStoreManager:
    def __init__(self):
        init_vertex_ai()
        self.embedding_function = VertexAIEmbeddings(model_name="text-embedding-005")

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
                clean[k] = ", ".join(map(str, v))  #  Convert list to comma-separated string
            else:
                clean[k] = str(v)  # Catch-all
        return clean

    async def vectordb_add(self, docs, vectordb_name="vectorDB"):

        base_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data_warehouse", vectordb_name)
        )
        print("Embedding data to vector store:", base_dir)

        if not docs:
            print("❌ No documents to embed.")
            return False

        embeddings = []
        valid_docs = []

        for i, doc in enumerate(docs):
            content = doc.page_content.strip()
            if not content:
                print(f"⚠️ Skipping empty content at index {i}")
                continue

            try:
                emb = await self.embedding_function.aembed_query(content)
                if not emb or not isinstance(emb, list):
                    print(f"❌ Invalid embedding at index {i}")
                    continue

                embeddings.append(emb)
                valid_docs.append(doc)
            except Exception as e:
                print(f"❌ Embedding error at index {i}: {e}")
                continue

        if not embeddings:
            print("❌ No valid embeddings were created.")
            return False



        print(f"✅ Created {len(embeddings)} embeddings. First vector size: {len(embeddings[0])}")


        client = chromadb.PersistentClient(path=base_dir)
        try:
            collection = client.get_collection(name=vectordb_name)
        except Exception as e:
            print(f"❌ Failed to get collection: {e}")
            return False

        try:
            collection.add(
                documents=[doc.page_content for doc in valid_docs],
                embeddings=embeddings,
                metadatas=[self.sanitize_metadata(doc.metadata) for doc in valid_docs],
                ids=[f"doc_{i}" for i in range(len(valid_docs))],
            )
            print("📥 Successfully added to collection.")
            print("🧮 Total docs in collection:", collection.count())
            return True
        except Exception as e:
            print(f"❌ Failed to add documents to Chroma: {e}")
            return False

    def vectordb_query_filtering(self, query, vectordb_name="vectorDB", k=3, metadata_filter: dict = None):
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

        results = vectorstore.similarity_search(query, k=k, filter=metadata_filter)

        return results


    async def proto_add_final(self, company_name):
        chunker = ScraperManager()
        data = await chunker.chunking(company_name)
        success = await self.vectordb_add(data)

        return success



if __name__ == "__main__":
    test = VectorStoreManager()

    query = (
        "Summarize all clauses related to data sharing, user consent, third-party access, "
        "data retention, tracking, targeted advertising, user rights, and account deletion. "
        "Highlight anything that could affect user privacy or security."
        "github"
        ""
    )
    metadata = {"domain":"https://www.youtube.com/"}

    result = test.vectordb_query_chatbot("What is the cookie policy?", metadata_filter=metadata)
    print(result)






