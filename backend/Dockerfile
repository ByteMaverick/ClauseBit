FROM python:3.11-slim

# Create working dir inside container
WORKDIR /app/backend

# Install dependencies for compiling (if needed)
RUN apt-get update && apt-get install -y build-essential

# Copy just requirements.txt first (for cache)
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from your local backend folder into the container's /app/backend
COPY . .

# Optional: Set PYTHONPATH if you're using `from backend.src...`
ENV PYTHONPATH=/app

EXPOSE 8080

# Start the backend (adjust path if needed)
CMD ["python3", "src/api.py"]
