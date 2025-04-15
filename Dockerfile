# Use the Node official image
# https://hub.docker.com/_/node
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Copy local code to the container image
COPY . ./

# Install packages
RUN npm install --legacy-peer-deps

# Creates a "dist" folder with the production build
RUN npm run build

# Serve the app
CMD ["npm", "run", "start"]