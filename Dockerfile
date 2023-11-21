FROM node:18.18.0-buster

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Start server
CMD [ "node", "index.js" ]