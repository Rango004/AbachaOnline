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

# Expose default port
EXPOSE 5005

# Override ENTRYPOINT and use shell form to expand PORT variable
ENTRYPOINT []
CMD /bin/bash -c "rasa run --enable-api --port ${PORT:-5005} --cors '*' -m models/model.tar.gz"
