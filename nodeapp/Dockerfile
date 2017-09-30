FROM node:alpine
MAINTAINER Manjit Kumar <manjitpandeybth@gmail.com>

RUN apk update

RUN apk add bash curl wget ansible jq git

WORKDIR /home/nodeapp/

COPY / /home/nodeapp/

RUN npm install

ENTRYPOINT ["node","server/server.js"]
