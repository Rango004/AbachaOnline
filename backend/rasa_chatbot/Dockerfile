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

# Create supervisor config to run both RASA and action server
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:rasa]\n\
command=/bin/bash -c "rasa run --enable-api --port ${PORT:-5005} --cors * -m models/model.tar.gz"\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
autorestart=true\n\
\n\
[program:actions]\n\
command=rasa run actions --port 5055\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
autorestart=true' > /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 5005 5055

# Override ENTRYPOINT
ENTRYPOINT []

# Run supervisor to start both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
