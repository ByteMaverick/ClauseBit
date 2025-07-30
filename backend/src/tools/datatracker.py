import os

from google.cloud import firestore


# 🔐 Set Firestore Credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/mohammedansari/Desktop/clausebit/backend/src/utils/clausebit-firestore-key.json"

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






