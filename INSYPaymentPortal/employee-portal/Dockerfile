# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate SSL certificates for development
RUN apk add --no-cache openssl && \
    mkdir -p ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/localhost-key.pem \
    -out ssl/localhost.pem \
    -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"

# Build the React application
RUN npm run build

# Expose port
EXPOSE 3002

# Start the application with HTTPS
CMD ["npm", "start"]
