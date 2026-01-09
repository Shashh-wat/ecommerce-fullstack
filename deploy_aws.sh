#!/bin/bash

# Configuration
REGION="us-east-1" # You can change this
REPO_NAME="ecommerce-fullstack"

echo "Deploying to AWS ECR & App Runner"
echo "Region: $REGION"
echo "Repository: $REPO_NAME"

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed."
    echo "Please install it: https://aws.amazon.com/cli/"
    exit 1
fi

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$ACCOUNT_ID" ]; then
    echo "❌ Error: Could not get AWS Account ID. Are you logged in?"
    echo "Run 'aws configure' or 'aws sso login'."
    exit 1
fi

FULL_IMAGE_NAME="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"

echo "AWS Account: $ACCOUNT_ID"

# 1. Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 2. Create Repository (if not exists)
echo "📦 Checking repository..."
aws ecr describe-repositories --repository-names $REPO_NAME --region $REGION > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "   Creating repository '$REPO_NAME'..."
    aws ecr create-repository --repository-name $REPO_NAME --region $REGION
else
    echo "   Repository exists."
fi

# 3. Build Docker Image
echo "🔨 Building Docker image (platform linux/amd64)..."
# App Runner needs amd64
docker build --platform linux/amd64 -t $REPO_NAME .

# 4. Tag Image
echo "Tt Tagging image..."
docker tag $REPO_NAME:latest $FULL_IMAGE_NAME:latest

# 5. Push Image
echo "Hz Pushing image to ECR..."
docker push $FULL_IMAGE_NAME:latest

echo "✅ Image pushed successfully!"
echo "   Image URI: $FULL_IMAGE_NAME:latest"
echo ""
echo "🚀 NEXT STEP: Go to AWS App Runner Console"
echo "1. Create Service -> Source: Container Image"
echo "2. Image URI: $FULL_IMAGE_NAME:latest"
echo "3. Deployment settings: Automatic"
echo "4. Configuration:"
echo "   - Port: 8080"
echo "   - Environment Variables:"
echo "     SUPABASE_URL = https://miivxtkieuciwxweblda.supabase.co"
echo "     SUPABASE_KEY = [YOUR_ANON_KEY]"
echo "     DATABASE_URL = postgresql://postgres:[YOUR_DB_PASSWORD]@db.miivxtkieuciwxweblda.supabase.co:5432/postgres"
echo ""
