# Deploy OSRM to Fly.io

## Prerequisites

1. Fly.io account (free tier available)
2. Fly CLI installed
3. Sierra Leone OSM data (sierra-leone-latest.osm.pbf)

## Deployment Steps

### 1. Download OSM Data

```bash
cd osrm-deployment
wget https://download.geofabrik.de/africa/sierra-leone-latest.osm.pbf
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create Fly App

```bash
fly apps create abacha-osrm
```

### 4. Create Persistent Volume

```bash
fly volumes create osrm_data --size 3 --region iad
```

### 5. Deploy

```bash
fly deploy
```

### 6. Get Your OSRM URL

```bash
fly status
# Output will show: https://abacha-osrm.fly.dev
```

### 7. Test Your Deployed OSRM

```bash
curl "https://abacha-osrm.fly.dev/route/v1/driving/-12.071,8.112;-12.072,8.113?overview=false"
```

## Update Railway Backend

Add environment variable to Railway:

```
OSRM_URL=https://abacha-osrm.fly.dev
```

## Costs

- Fly.io free tier: 3 VMs (256MB RAM each) - Should be sufficient for OSRM
- If you need more: ~$5-10/month for dedicated instance

## Alternative: DigitalOcean

If Fly.io doesn't work, use DigitalOcean:

1. Create Droplet ($6/month)
2. Install Docker
3. Run OSRM container
4. Point Railway to your droplet IP
