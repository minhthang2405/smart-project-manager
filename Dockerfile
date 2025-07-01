# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy basic app
COPY app-basic.js ./

# List files to debug
RUN ls -la

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
