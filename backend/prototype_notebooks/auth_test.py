from langchain_google_vertexai import ChatVertexAI

from auth.init_vertex import init_vertex_ai

init_vertex_ai()

llm = ChatVertexAI(
    model="gemini-2.0-flash-lite",
    temperature=0.8,
    max_output_tokens= 8000
)
print(llm.invoke("hi"))