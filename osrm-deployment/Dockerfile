FROM osrm/osrm-backend:latest

# Copy Sierra Leone OSM data
COPY sierra-leone-latest.osm.pbf /data/

# Preprocess data
WORKDIR /data
RUN osrm-extract -p /opt/car.lua sierra-leone-latest.osm.pbf && \
    osrm-partition sierra-leone-latest.osrm && \
    osrm-customize sierra-leone-latest.osrm

# Expose OSRM port
EXPOSE 5000

# Start OSRM server
CMD ["osrm-routed", "--algorithm", "mld", "/data/sierra-leone-latest.osrm", "--port", "5000"]
