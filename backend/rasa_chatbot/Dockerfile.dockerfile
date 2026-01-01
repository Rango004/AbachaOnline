Create AbachaOL\backend\rasa_chatbot\Dockerfile:

# Create the file
notepad Dockerfile
Paste this content:

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy language model
RUN python -m spacy download en_core_web_md

# Copy all RASA files
COPY . .

# Train the RASA model
RUN rasa train --fixed-model-name model

# Expose RASA port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5005/ || exit 1

# Start RASA server
CMD ["rasa", "run", "--enable-api", "--port", "5005", "--cors", "*"]