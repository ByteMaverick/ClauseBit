import os
from dotenv import load_dotenv
from vertexai import init
from auth.gcp_auth import use_local_credentials

def init_vertex_ai():
    load_dotenv()

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "your-fallback-project")

    if use_local_credentials():
        print("Using local credentials.")
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    else:
        print("Using Cloud Run service account.")

    init(project=project_id, location="us-central1")
