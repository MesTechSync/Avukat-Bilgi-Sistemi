# Node.js 18 base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Panel/package*.json ./Panel/

# Install dependencies
RUN npm install
RUN cd Panel && npm install

# Copy source code
COPY . .

# Build the application
RUN cd Panel && npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["cd", "Panel", "&&", "npm", "run", "preview", "--", "--port", "3000", "--host", "0.0.0.0"]