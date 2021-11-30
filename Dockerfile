FROM node:12

RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

# COPY . .
COPY package*.json ./

RUN npm install

ENV NODE_ENV "develop"
ENV USE_PORT "8080"
ENV DB_CONNECTION "mongodb+srv://pain1127:psk2950!@skpark.cmkar.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

# 앱 소스 추가
COPY . .

# 애플케이션에서 사용하는 포트 정리해서 추가 예정

EXPOSE 8080

CMD ["npm", "start"]


