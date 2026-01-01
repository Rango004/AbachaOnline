# Use official RASA image - all dependencies pre-built and working
FROM rasa/rasa:3.6.0

WORKDIR /app

# Switch to root for installations
USER root

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy RASA configuration files
COPY config.yml domain.yml ./
COPY data/ ./data/

# Copy credentials and endpoints
COPY credentials.yml endpoints.yml ./

# Copy actions if they exist
COPY actions.py ./

# Switch back to non-root user for security
USER 1001

# Train the RASA model
RUN rasa train --fixed-model-name model

# Expose RASA port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5005/ || exit 1

# Start RASA server
CMD ["run", "--enable-api", "--port", "5005", "--cors", "*"]
