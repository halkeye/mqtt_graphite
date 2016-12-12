FROM node:6.6.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
