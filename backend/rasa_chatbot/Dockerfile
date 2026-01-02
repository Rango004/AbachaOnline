# Use official RASA FULL image - includes spaCy and all NLP dependencies
FROM rasa/rasa:3.6.0-full

WORKDIR /app

# Switch to root for installations
USER root

# Install curl, supervisor (for running both RASA + action server)
RUN apt-get update && apt-get install -y curl supervisor && \
    rm -rf /var/lib/apt/lists/* && \
    python -m spacy download en_core_web_md

# Install action server dependencies (database driver)
COPY requirements-actions.txt ./
RUN pip install --no-cache-dir -r requirements-actions.txt

# Copy pre-trained model (trained locally)
COPY models/model.tar.gz ./models/

# Copy config files needed for runtime
COPY domain.yml credentials.yml endpoints.yml ./

# Copy actions
COPY actions.py ./

# Copy supervisor config to run both RASA and action server
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 5005 5055

# Override ENTRYPOINT
ENTRYPOINT []

# Run supervisor to start both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
