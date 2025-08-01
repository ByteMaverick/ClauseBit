import os

from langchain_core.output_parsers import JsonOutputParser,StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI

from auth.init_vertex import init_vertex_ai
from backend.src.tools.vector_store import VectorStoreManager
from langchain_core.prompts import ChatPromptTemplate
# Set environment variables early
#os.environ["LANGSMITH_API_KEY"] = os.environ.get("LANGSMITH_API_KEY", "")
#os.environ["LANGSMITH_PROJECT"] = os.environ.get("LANGSMITH_PROJECT", "ClauseBit")
#os.environ["LANGSMITH_TRACING_V2"] = os.environ.get("LANGSMITH_TRACING_V2", "true")

import os
os.environ["LANGCHAIN_TRACING_V2"] = "false"


def summary(url: str):

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         '''You are a policy analyzer that extracts structured privacy clause summaries from legal content (e.g., Terms of Service, Privacy Policies). 
    Your output will be used to populate a UI that flags risky clauses and summarizes user impact.'''),

        ("human", '''Given the following policy text, analyze it and ensure the information is relevant to the specified {url}. If the text is unrelated or the {url} is not provided, generate the JSON in this format:

        {{
          "error": true,
          "message": "Unable to find data due to bot protection rules",
          "riskLevel": "Unknown",
          "summaryText": "Data unavailable"
        }}

        Produce a valid JSON object using the structure below.
        Return exactly 4 clauses. Each clause's description must not exceed 35 words.

        Do NOT include variable names, markdown formatting, or explanations.

        Example format:
        {{
          "error": false,
          "riskLevel": "Some risks found at github.com",
          "summaryText": "Data sharing is allowed with third parties.",
          "clauses": [
            {{
              "type": "danger",
              "icon": "alert-triangle",
              "title": "Data Sharing",
              "description": "Your data may be shared with third parties such as vendors and partners."
            }},
            {{
              "type": "neutral",
              "icon": "database",
              "title": "Data Retention",
              "description": "Your data is stored for at least 6 months after your account is deleted."
            }},
            {{
              "type": "success",
              "icon": "check-circle",
              "title": "Location Tracking",
              "description": "Your location is not tracked."
            }},
            {{
              "type": "success",
              "icon": "check-circle",
              "title": "Data Security",
              "description": "Reasonable measures are used to protect your data."
            }}
          ]
        }}

        Policy Text:
        \"\"\"
        {data}
        \"\"\"
        ''')

    ])

    query = (
        "Summarize all clauses related to data sharing, user consent, third-party access, "
        "data retention, tracking, targeted advertising, user rights, and account deletion. "
        "Highlight anything that could affect user privacy or security."
    )

    metadata = {"domain": url}

    vectorstore = VectorStoreManager()
    data = vectorstore.vectordb_query_chatbot(query=query, k=4, metadata_filter=metadata)

    # LLM
    llm = ChatVertexAI(
        model="gemini-2.0-flash-lite",
        temperature=0.2,
        max_output_tokens=500
    )
    base_chain = prompt | llm | JsonOutputParser()

    response = base_chain.invoke({
        "data": data,
        "url": url
    })
    print("done")

    if response["error"] == True:
        print("Using LLM fallback!")
        response = summary_no_retrieval(url)

        print(response)


    return response


def summary_no_retrieval(url:str):
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         '''You are a policy analyzer that generates structured privacy clause summaries based on your existing knowledge of specific companies and their privacy policies.

    IMPORTANT: Only generate analysis if you have actual knowledge of the specific company's privacy policy from the provided URL. Do NOT generate generic or assumed information.

    If you don't have specific knowledge about the company's actual privacy policy, return the error JSON format instead.'''),

        ("human", '''Analyze the following URL and generate a privacy policy risk assessment ONLY if you have specific knowledge of this company's actual privacy policy practices.

    URL: {url}

    If you DO NOT have specific knowledge about this company's privacy policy, return this error format:
    {{
      "error": true,
      "message": "Unable to find data due to bot protection rules",
      "riskLevel": "Unknown",
      "summaryText": "Data unavailable",
  
    }}

    If you DO have specific knowledge about this company's privacy policy, produce a valid JSON object with exactly 4 clauses. Each clause description must not exceed 35 words.

    Return ONLY the JSON object with no additional text, formatting, or explanations.

    Success format (only if you have actual knowledge):
    {{
      "riskLevel": "Risk assessment for [domain]",
      "summaryText": "Brief summary based on actual known policy",
      "clauses": [
        {{
          "type": "danger|warning|neutral|success",
          "icon": "alert-triangle|alert-circle|database|shield|check-circle|eye|users|lock",
          "title": "Actual Policy Aspect",
          "description": "Real information from known policy under 35 words"
        }},
        {{
          "type": "neutral",
          "icon": "database", 
          "title": "Data Retention",
          "description": "Actual data retention practices if known"
        }},
        {{
          "type": "warning|success",
          "icon": "eye|shield",
          "title": "Tracking/Privacy",
          "description": "Real tracking practices or privacy protections if known"
        }},
        {{
          "type": "success|neutral|warning",
          "icon": "lock|shield|users",
          "title": "Security/Access",
          "description": "Actual security measures or access controls if known"
        }}
      ]
    }}''')
    ])

    # LLM
    llm = ChatVertexAI(
        model="gemini-2.0-flash-lite",
        temperature=0.2,
        max_output_tokens=3000
    )
    base_chain = prompt | llm | JsonOutputParser()

    response = base_chain.invoke({
        "url": url
    })
    print("done")
    print(url)

    return response



