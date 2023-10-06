FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 443
EXPOSE 80
ENTRYPOINT ["npm","run","start_docker"]
