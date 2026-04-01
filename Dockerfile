# --- STAGE 1: Build React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build

# Copy the react project
COPY telegram_ucp_project/gaura_platform/gaura_mobile_react/package.json ./
COPY telegram_ucp_project/gaura_platform/gaura_mobile_react/package-lock.json* ./
RUN npm install

COPY telegram_ucp_project/gaura_platform/gaura_mobile_react/ ./
RUN npm run build

# --- STAGE 2: Python Monolith ---
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for psycopg2 and other tools
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY req1.txt req2.txt ./
RUN pip install --no-cache-dir -r req1.txt && pip install --no-cache-dir -r req2.txt
RUN pip install "fastapi[all]" mcp telethon python-dotenv supabase google-generativeai openai httpx psycopg2-binary

# Copy the entire backend codebase
COPY . .

# Copy the built frontend from Stage 1 into the correct location for the server
COPY --from=frontend-builder /build/dist ./telegram_ucp_project/gaura_platform/gaura_mobile_react/dist

# Expose the monolith port
EXPOSE 8500

# Boot sequence (RAM Optimized Monolith)
CMD ["python", "monolith.py"]
