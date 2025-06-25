
# Deploy to DigitalOcean App Platform

## Step 1: Create App on DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Choose "GitHub" as source
4. Select your repository and the `main` branch
5. Set source directory to `/server`

## Step 2: Configure Build Settings

- **Build Command**: `npm install`
- **Run Command**: `npm start`
- **HTTP Port**: `3001`

## Step 3: Environment Variables

Add these environment variables in the DigitalOcean dashboard:

```
NODE_ENV=production
PORT=3001
RTMP_PORT=1935
HLS_PORT=8080
MEDIA_ROOT=/tmp/media
DIGITALOCEAN_APP_URL=your-app-name.ondigitalocean.app
```

## Step 4: Enable Custom Ports

In the DigitalOcean App settings:
1. Go to Settings → Components
2. Enable custom TCP ports
3. Add port 1935 for RTMP
4. Add port 8080 for HLS

## Step 5: Deploy

Click "Create Resources" and wait for deployment.

## Step 6: Test OBS Connection

Once deployed, your RTMP URL will be:
`rtmp://your-app-name.ondigitalocean.app:1935/live`

Use this in OBS Server field, plus your stream key.

## Cost

Basic plan starts at ~$12/month for the resources needed for streaming.
