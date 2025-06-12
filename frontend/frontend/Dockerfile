FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application with eslint checks disabled
RUN npm run build -- --no-lint

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]