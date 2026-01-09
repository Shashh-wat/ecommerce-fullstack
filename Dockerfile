FROM python:3.9-slim

WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Frontend Code
COPY ["Kozhikode Reconnect V1", "./frontend"]
WORKDIR /app/frontend

# Build Frontend
# We use a dummy key for the build if not provided, but mostly these are needed at runtime or baked in 
# if we use VITE_ prefix. We'll pass them as build args if strictly necessary, but usually VITE_ env vars 
# are baked in at build time. Since we want runtime config, we might need a runtime env.js solution, 
# but for now we'll assume we bake them in or defaults. 
# ACTUAL STRATEGY: We will let the user pass them as build args or just use the defaults for now?
# The user needs to provide keys. For the build to succeed, we just run it.
RUN npm install
RUN npm run build

WORKDIR /app

# Move dist to root
RUN mv frontend/dist ./dist

# Copy Backend Code
COPY backend_supabase.py .

# Expose port
ENV PORT 8080
EXPOSE 8080

# Run the application
CMD exec uvicorn backend_supabase:app --host 0.0.0.0 --port ${PORT}
