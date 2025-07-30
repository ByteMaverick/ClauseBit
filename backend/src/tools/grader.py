import numpy as np
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

from auth.init_vertex import init_vertex_ai
from langchain_google_vertexai import VertexAIEmbeddings, ChatVertexAI


class Grader:
    def __init__(self):
        init_vertex_ai()
        self.embedding_function = VertexAIEmbeddings(model_name="text-embedding-005")
        self.llm = ChatVertexAI(
            model="gemini-2.0-flash-lite",
            temperature=0.8,
            max_output_tokens=600
        )

    def batch_cosine_similarity(self, query_vec, doc_vecs):
        query_vec = np.array(query_vec)
        doc_vecs = np.array(doc_vecs)
        dot_products = np.dot(doc_vecs, query_vec)
        norms = np.linalg.norm(doc_vecs, axis=1) * np.linalg.norm(query_vec)
        return dot_products / norms

    def SimilarityScore(self, chunks, query):
        # Get embedding for the query
        emb_query = self.embedding_function.embed_query(query)

        # Get embeddings for all chunks in a single batch
        chunk_embeddings = self.embedding_function.embed_documents(chunks)

        # Compute cosine similarities efficiently
        sims = self.batch_cosine_similarity(emb_query, chunk_embeddings)
        average_score = np.mean(sims)

        return average_score

    def llm_grader(self, chunks, query):
        """
        Composite Scoring:
        - alpha = 0.4 for embedding similarity
        - beta = 0.3 for relevance
        - gamma = 0.15 for completeness
        - delta = 0.15 for faithfulness
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Evaluate the following chunk for how well it answers the user query."),
            ("human", '''
    Return only one valid JSON object. No markdown, no explanation.

    Query:
    {query}

    Chunk:
    {chunk}

    Rate from 1 to 5 for:
    - Relevance
    - Completeness
    - Faithfulness

    Output format:
    relevance: x
    completeness: x
    faithfulness: x
            ''')
        ])

        base_chain = prompt | self.llm | JsonOutputParser()


        if isinstance(chunks, str):
            chunks = [chunks]

        scores = []

        for chunk in chunks:
            response = base_chain.invoke({
                "query": query,
                "chunk": chunk,
            })

            similarity_score = self.SimilarityScore([chunk], query)

            # Normalize LLM ratings to 0–1 scale
            rel = response["relevance"] / 5
            comp = response["completeness"] / 5
            faith = response["faithfulness"] / 5

            # Weighted average
            alpha = 0.4
            beta = 0.3
            gamma = 0.15
            delta = 0.15

            composite_score = (
                    alpha * similarity_score +
                    beta * rel +
                    gamma * comp +
                    delta * faith
            )

            scores.append({
                "chunk": chunk,
                "similarity": float(round(similarity_score, 3)),
                "relevance": response["relevance"],
                "completeness": response["completeness"],
                "faithfulness": response["faithfulness"],
                "composite_score": float(round(composite_score, 3))
            })

        return scores


grader = Grader()

question = "Does neetcode.io share data"
question = "What is ClauseBit and how does it protect privacy?"
retrieval_chunks = [
    "ClauseBit is a browser extension that analyzes privacy policies using AI to flag risky clauses like data resale, location tracking, and auto-renewal traps. It summarizes them and offers a real-time risk score."
]

score = grader.SimilarityScore(retrieval_chunks, question)
print(f"Embedding Similarity Score: {score:.3f}")

score = grader.llm_grader(retrieval_chunks,question)
print(score)
