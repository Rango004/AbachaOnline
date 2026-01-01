# Use official RASA FULL image - includes spaCy and all NLP dependencies
FROM rasa/rasa:3.6.0-full

WORKDIR /app

# Switch to root for installations
USER root

# Install curl for health checks and download smaller spaCy model (saves ~200MB RAM)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    python -m spacy download en_core_web_sm

# Copy RASA configuration files
COPY config.yml domain.yml ./
COPY data/ ./data/

# Copy credentials and endpoints
COPY credentials.yml endpoints.yml ./

# Copy actions if they exist
COPY actions.py ./

# Switch back to non-root user for security
USER 1001

# Train the RASA model (with smaller spaCy to save memory)
RUN rasa train --fixed-model-name model

# Expose RASA port
EXPOSE 5005

# Health check with longer timeout for model loading
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:5005/ || exit 1

# Start RASA server
CMD ["run", "--enable-api", "--port", "5005", "--cors", "*"]
