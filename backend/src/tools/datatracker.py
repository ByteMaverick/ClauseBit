import os

from google.cloud import firestore
from auth.init_vertex import init_vertex_ai


init_vertex_ai()
# 🧠 Firestore Client
db = firestore.Client()
company_collection = db.collection("CompanyList")




def add_company(url: str,found_data: bool,issue = None):
    doc_ref = company_collection.document()  # Automatically generates a unique ID
    doc_ref.set({
        "url": url,
        "timestamp": firestore.SERVER_TIMESTAMP, # Optional: tracks when it was added
        "found_data":found_data,
        "issue": issue

    })
    print("Done")


def url_in_db(url: str) -> bool:
    # Query Firestore to see if a document with the given URL exists
    query = company_collection.where("url", "==", url).limit(1).get()
    return len(query) > 0  # True if found, False otherwise


def get_company_by_url(url: str):
    query = company_collection.where("url", "==", url).limit(1).get()
    if query:
        doc = query[0]
        return {
            "id": doc.id,
            "url": doc.get("url"),
            "timestamp": doc.get("timestamp"),
            "found_data": doc.get("found_data"),
            "issue": doc.get("issue")
        }
    else:
        return  False






