# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files first for better caching
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm ci --only=production

# Copy all source code
COPY . .

# Expose port
EXPOSE 3000

# Start the full server
CMD ["npm", "start"]
