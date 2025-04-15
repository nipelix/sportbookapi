
# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application if needed (uncomment if you have a build step)
# RUN yarn build

# Expose the port your app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "start"]