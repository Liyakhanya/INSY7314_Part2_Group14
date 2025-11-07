# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install openssl for SSL certificate generation
RUN apk add --no-cache openssl

# Create SSL directory and generate self-signed certificates
RUN mkdir -p ssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/localhost-key.pem \
    -out ssl/localhost.pem \
    -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"

# Copy source code
COPY . .

# Create a startup script that handles both environments
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🔧 Starting Banking API Server..."' >> /app/start.sh && \
    echo 'echo "🌐 Environment: \$NODE_ENV"' >> /app/start.sh && \
    echo 'echo "🔗 Database: \$CONN_STRING"' >> /app/start.sh && \
    echo 'node app.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Health check (will use the health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node health-check.js

# Start the application using the script
CMD ["/app/start.sh"]