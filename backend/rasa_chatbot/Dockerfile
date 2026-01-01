FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including all build tools needed for RASA
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    gcc \
    g++ \
    git \
    python3-dev \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install build dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir Cython

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
