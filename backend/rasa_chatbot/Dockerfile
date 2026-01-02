# Use official RASA FULL image - includes spaCy and all NLP dependencies
FROM rasa/rasa:3.6.0-full

WORKDIR /app

# Switch to root for installations
USER root

# Install curl for health checks and download spaCy model
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    python -m spacy download en_core_web_md

# Copy pre-trained model (trained locally)
COPY models/model.tar.gz ./models/

# Copy config files needed for runtime
COPY domain.yml credentials.yml endpoints.yml ./

# Switch back to non-root user for security
USER 1001

# Expose RASA port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5005}/ || exit 1

# Start RASA server with pre-trained model (use PORT env var or default to 5005)
CMD ["sh", "-c", "rasa run --enable-api --port ${PORT:-5005} --cors '*' -m models/model.tar.gz"]
