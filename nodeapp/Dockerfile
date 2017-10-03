FROM node:alpine
MAINTAINER Manjit Kumar <manjitpandeybth@gmail.com>

RUN apk update

RUN apk add bash curl wget  ansible jq curl git

RUN apk add --no-cache make gcc g++ python

WORKDIR /home/nodeapp/

COPY package.json /home/nodeapp/

RUN npm install

COPY / /home/nodeapp/

CMD ["node","server/server.js"]
