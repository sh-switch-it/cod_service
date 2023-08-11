FROM node:10
WORKDIR /usr/src/app
COPY package.json ./
RUN npm config set registry=https://registry.npm.taobao.org
RUN npm install
COPY . .
EXPOSE 3010

ENTRYPOINT ["npm","run","start"]


# docker build --build-arg npm_script=start -t serai/trheads-tool-api .
# docker run -p 8080:3010 -d -e APP_ENV=prod serai/trheads-tool-api
