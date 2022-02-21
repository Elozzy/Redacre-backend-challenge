FROM node:16
# Create app directory
WORKDIR /usr/src/app

# Copy and download dependencies
COPY package.json /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)


RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080


#command to run within the container
CMD [ "node", "server.js" ]