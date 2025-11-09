# Use an official Node runtime as a parent image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (including dev dependencies for nodemon)
COPY package*.json ./

RUN npm ci

# Install nodemon globally
RUN npm install -g nodemon

# Bundle app source
COPY . .

# Expose port (should match PORT env var)
EXPOSE 5500

# Default command
CMD ["nodemon", "index.js"]
