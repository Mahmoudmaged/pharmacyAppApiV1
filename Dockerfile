

FROM node:20.0

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install 

COPY . .

CMD ["node", "index.js"]