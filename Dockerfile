# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for SQLite, generic builds, and debugging if necessary)
RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them primarily 
COPY telegram_ucp_project/requirements.txt ./req1.txt
COPY telegram_ucp_project/gaura_platform/requirements.txt ./req2.txt
RUN pip install --no-cache-dir -r req1.txt && pip install --no-cache-dir -r req2.txt

# Some core MCP or specific telethon/asyncio libraries in case they aren't fully listed
RUN pip install "fastapi[all]" mcp telethon python-dotenv supabase google-generativeai openai httpx

# Copy the entire codebase into the container
COPY . .

# Ensure python modules can resolve properly
ENV PYTHONPATH="/app/telegram_ucp_project:/app/telegram_ucp_project/gaura_platform"
ENV GRPC_DNS_RESOLVER="native"

# Expose the single unified frontend port the cloud platform expects
# (Some platforms pass the dynamically assigned port via $PORT)
ENV HOST="0.0.0.0"
EXPOSE 8500

# Give execute permissions to launcher
RUN chmod +x launch_all.py

# Boot sequence (Memory Optimized Monolith)
CMD ["python", "monolith.py"]
