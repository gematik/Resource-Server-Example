FROM node:14-alpine

ARG http_proxy_arg=""
ARG https_proxy_arg=""
ARG noproxy_arg=""

ENV HTTP_PROXY=$http_proxy_arg
ENV HTTPS_PROXY=$https_proxy_arg
ENV NO_PROXY=$noproxy_arg
ENV NODE_ENV=test

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --unsafe-perm true
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN unset HTTP_PROXY
RUN unset HTTPS_PROXY
RUN unset NO_PROXY


# Use non-root user to secure container
# Create a group and user and Tell docker that all future commands should run as the appuser user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3500
CMD [ "npm", "run", "test" ]
