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

# Set up non-root user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies (must be done as root)
USER root
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*
USER user

# Install Python dependencies
COPY --chown=user req1.txt req2.txt ./
RUN pip install --no-cache-dir --user -r req1.txt && pip install --no-cache-dir --user -r req2.txt
RUN pip install --user "fastapi[all]" mcp telethon python-dotenv supabase google-generativeai openai httpx psycopg2-binary

# Copy the entire backend codebase
COPY --chown=user . $HOME/app

# Copy the built frontend from Stage 1
COPY --chown=user --from=frontend-builder /build/dist ./telegram_ucp_project/gaura_platform/gaura_mobile_react/dist

# Expose the HF default port
EXPOSE 7860

# Boot sequence (RAM Optimized Monolith)
CMD ["python", "monolith.py"]
