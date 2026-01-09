#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="ecommerce-fullstack"  # Renamed service
REGION="us-central1"

# Load environment variables from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No Google Cloud Project selected."
  echo "Run 'gcloud config set project [YOUR_PROJECT_ID]' first."
  exit 1
fi

echo "Deploying to Project: $PROJECT_ID"

# We need the Supabase keys to bake them into the frontend build.
# We will prompt for them if not set in ENVs.
# But for now, we'll assume the user will edit this script or run with env vars.

echo "⚠️  NOTE: Ensure VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY are set if not using defaults."

# Docker Build & Submit
# We pass build-args if we want to bake in env vars.
echo "Building container..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL},SUPABASE_KEY=${SUPABASE_KEY},DATABASE_URL=${DATABASE_URL}"

echo "Deployment complete!"
