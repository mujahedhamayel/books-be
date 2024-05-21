# Use the official Node.js image.
FROM node:20.11.1

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# 
RUN npm install bcrypt


# Install production dependencies.
# RUN npm install && npm rebuild bcrypt --build-from-source

# Copy local code to the container image.
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Run the web service on container startup.
CMD [ "node", "app.js" ]
