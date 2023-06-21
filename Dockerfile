# Specify a base image
FROM node:18

# Set a working directory
WORKDIR /usr/src/app

# Install dependencies
# First copy dependency definitions
COPY package.json .

# Install dependencies using npm
RUN npm install

# Copy all files from current directory to docker
COPY . .

# Specify a command to run on container startup
CMD [ "node", "index.js" ]
